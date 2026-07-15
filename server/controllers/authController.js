import crypto from 'crypto';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendTokenResponse } from '../utils/token.js';
import { sendMail } from '../config/nodemailer.js';
import { uploadImage } from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    phone,
    verificationToken,
    verificationTokenExpire
  });

  // Create empty Cart and Wishlist for user
  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, products: [] });

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  const message = `
    <h1>Email Verification Required</h1>
    <p>Thank you for registering. Please click on the link below to verify your email address:</p>
    <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
    <p>Note: This link will expire in 24 hours.</p>
  `;

  await sendMail({
    to: user.email,
    subject: 'Confirm Your Email Registration',
    html: message,
    text: `Please verify your email by clicking the link: ${verificationUrl}`
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. A verification email has been sent. Please check your inbox.'
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check user exists (include password since select is false in model)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Match password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Check if email is verified (Optional depending on business rule, let's allow login but show unverified warning on frontend)
  // Or we can let them log in anyway but flag it.

  // Send tokens response
  await sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout user & clear cookies
 * @route   POST /api/v1/auth/logout
 * @access  Protected
 */
export const logoutUser = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Remove the current refresh token from user db tokens list
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save({ validateBeforeSave: false });
    }
  }

  // Clear cookie options
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (Uses refresh token cookie)
 */
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ErrorResponse('No refresh token provided', 401));
  }

  try {
    // Verify refresh token signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 401));
    }

    // Check if refresh token is in user's valid tokens list
    if (!user.refreshTokens.includes(refreshToken)) {
      // Refresh token reuse detection: User token list might have been hijacked, clear all refresh tokens for security
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      
      res.clearCookie('refreshToken');
      return next(new ErrorResponse('Authorization session expired. Security warning: Token reuse detected.', 401));
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    res.clearCookie('refreshToken');
    return next(new ErrorResponse('Invalid or expired refresh token', 401));
  }
});

/**
 * @desc    Verify email address using token
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorResponse('Token is required for verification', 400));
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired email verification token', 400));
  }

  // Update verification status
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.'
  });
});

/**
 * @desc    Forgot Password - Request reset link
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('No user found with that email address', 404));
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set resetToken on schema
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const message = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because you (or someone else) requested a password reset for your account.</p>
    <p>Please click on the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>If you did not request this, please ignore this email. Note that this link will expire in 10 minutes.</p>
  `;

  await sendMail({
    to: user.email,
    subject: 'E-Commerce Password Reset Request',
    html: message,
    text: `Please reset your password by clicking the link: ${resetUrl}`
  });

  res.status(200).json({
    success: true,
    message: 'Reset password link sent. Please check your email.'
  });
});

/**
 * @desc    Reset password using reset token
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshTokens = []; // Log out from all other active sessions for safety

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.'
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Protected
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Retrieve user password explicitly
  const user = await User.findById(req.user.id).select('+password');

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Incorrect current password', 400));
  }

  // Update password
  user.password = newPassword;
  user.refreshTokens = []; // Clear other sessions for security
  await user.save();

  // Send new token
  await sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Protected
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user
  });
});

/**
 * @desc    Update user profile details
 * @route   PUT /api/v1/auth/profile
 * @access  Protected
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phone) user.phone = phone;

  // Handle avatar upload if a file is present
  if (req.file) {
    const uploadResult = await uploadImage(req.file.path, 'avatars');
    user.avatar = {
      url: uploadResult.url,
      publicId: uploadResult.publicId
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});
