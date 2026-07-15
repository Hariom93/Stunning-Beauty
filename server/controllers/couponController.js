import Coupon from '../models/Coupon.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/coupons
 * @access  Private
 */
export const getCoupons = asyncHandler(async (req, res, next) => {
  let query = {};
  
  // If not admin, only fetch active and unexpired coupons
  if (req.user.role !== 'Admin') {
    query = {
      status: 'active',
      expiryDate: { $gt: Date.now() }
    };
  }

  const coupons = await Coupon.find(query);

  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons
  });
});

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit } = req.body;

  const codeUpper = code.toUpperCase();
  const existingCoupon = await Coupon.findOne({ code: codeUpper });

  if (existingCoupon) {
    return next(new ErrorResponse(`Coupon with code '${codeUpper}' already exists`, 400));
  }

  const coupon = await Coupon.create({
    code: codeUpper,
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount: maxDiscountAmount || 0,
    expiryDate,
    usageLimit: usageLimit || 1
  });

  res.status(201).json({
    success: true,
    coupon
  });
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }

  await Coupon.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

/**
 * @desc    Apply coupon code to cart amount
 * @route   POST /api/v1/coupons/apply
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    return next(new ErrorResponse('Please provide a coupon code', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });

  if (!coupon) {
    return next(new ErrorResponse('Invalid or inactive coupon code', 404));
  }

  if (coupon.isExpired()) {
    return next(new ErrorResponse('This coupon has expired', 400));
  }

  if (coupon.usageLimit <= coupon.usageCount) {
    return next(new ErrorResponse('This coupon code usage limit has been reached', 400));
  }

  // Check min order amount
  if (orderAmount < coupon.minOrderAmount) {
    return next(new ErrorResponse(`Minimum purchase of ₹${coupon.minOrderAmount} is required for this coupon`, 400));
  }

  // Check if current user has already used this coupon
  if (coupon.usersUsed.includes(req.user.id)) {
    return next(new ErrorResponse('You have already used this coupon code', 400));
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    // Fixed amount
    discountAmount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    },
    discountAmount
  });
});
