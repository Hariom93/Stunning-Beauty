import Brand from '../models/Brand.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all brands
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find();
  res.status(200).json({
    success: true,
    count: brands.length,
    brands
  });
});

/**
 * @desc    Create new brand
 * @route   POST /api/v1/brands
 * @access  Private/Admin
 */
export const createBrand = asyncHandler(async (req, res, next) => {
  const { name, logo, description, status } = req.body;

  const existingBrand = await Brand.findOne({ name });
  if (existingBrand) {
    return next(new ErrorResponse(`Brand '${name}' already exists`, 400));
  }

  const brand = await Brand.create({
    name,
    logo,
    description,
    status
  });

  res.status(201).json({
    success: true,
    brand
  });
});

/**
 * @desc    Update brand
 * @route   PUT /api/v1/brands/:id
 * @access  Private/Admin
 */
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { name, logo, description, status } = req.body;

  let brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ErrorResponse('Brand not found', 404));
  }

  const updates = {
    logo,
    description,
    status
  };

  if (name && name !== brand.name) {
    updates.name = name;
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    brand
  });
});

/**
 * @desc    Delete brand
 * @route   DELETE /api/v1/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ErrorResponse('Brand not found', 404));
  }

  await Brand.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Brand deleted successfully'
  });
});
