import Category from '../models/Category.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().populate('parentCategory', 'name slug');

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
});

/**
 * @desc    Create a new category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, parentCategory, status, image } = req.body;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new ErrorResponse(`Category '${name}' already exists`, 400));
  }

  const slug = slugify(name);

  // If parentCategory is supplied, ensure it exists
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      return next(new ErrorResponse('Parent category not found', 404));
    }
  }

  const category = await Category.create({
    name,
    slug,
    description,
    parentCategory: parentCategory || null,
    status,
    image
  });

  res.status(201).json({
    success: true,
    category
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, parentCategory, status, image } = req.body;
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const updates = {
    description,
    status,
    image
  };

  if (name && name !== category.name) {
    updates.name = name;
    updates.slug = slugify(name);
  }

  if (parentCategory !== undefined) {
    if (parentCategory === req.params.id) {
      return next(new ErrorResponse('A category cannot be its own parent', 400));
    }
    
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return next(new ErrorResponse('Parent category not found', 404));
      }
      updates.parentCategory = parentCategory;
    } else {
      updates.parentCategory = null;
    }
  }

  category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    category
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if any other category lists this category as a parent
  const children = await Category.find({ parentCategory: req.params.id });
  if (children.length > 0) {
    return next(new ErrorResponse('Cannot delete a category that has subcategories', 400));
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});
