import Address from '../models/Address.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get user addresses
 * @route   GET /api/v1/addresses
 * @access  Private
 */
export const getAddresses = asyncHandler(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    addresses
  });
});

/**
 * @desc    Create a new address
 * @route   POST /api/v1/addresses
 * @access  Private
 */
export const createAddress = asyncHandler(async (req, res, next) => {
  const { title, streetAddress, city, state, country, zipCode, phone, isDefault } = req.body;

  // Check if this is the first address, if so, make default
  const addressCount = await Address.countDocuments({ user: req.user.id });
  const makeDefault = addressCount === 0 ? true : isDefault;

  const address = await Address.create({
    user: req.user.id,
    title,
    streetAddress,
    city,
    state,
    country,
    zipCode,
    phone,
    isDefault: makeDefault
  });

  res.status(201).json({
    success: true,
    address
  });
});

/**
 * @desc    Update address
 * @route   PUT /api/v1/addresses/:id
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res, next) => {
  const { title, streetAddress, city, state, country, zipCode, phone, isDefault } = req.body;

  let address = await Address.findById(req.params.id);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Check ownership
  if (address.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this address', 403));
  }

  address.title = title || address.title;
  address.streetAddress = streetAddress || address.streetAddress;
  address.city = city || address.city;
  address.state = state || address.state;
  address.country = country || address.country;
  address.zipCode = zipCode || address.zipCode;
  address.phone = phone || address.phone;
  
  if (isDefault !== undefined) {
    address.isDefault = isDefault;
  }

  await address.save();

  res.status(200).json({
    success: true,
    address
  });
});

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/addresses/:id
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Check ownership
  if (address.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this address', 403));
  }

  const wasDefault = address.isDefault;
  await Address.findByIdAndDelete(req.params.id);

  // If deleted address was default, set another address as default
  if (wasDefault) {
    const anotherAddress = await Address.findOne({ user: req.user.id });
    if (anotherAddress) {
      anotherAddress.isDefault = true;
      await anotherAddress.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});
