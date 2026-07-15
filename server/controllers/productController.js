import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import APIFeatures from '../utils/apiFeatures.js';
import { uploadImage } from '../config/cloudinary.js';

/**
 * @desc    Get all products (with search, filter, sort, paginate)
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res, next) => {
  // Count total documents before skip/limit for pagination info
  const countFeatures = new APIFeatures(Product.find({ status: 'active' }), req.query)
    .search()
    .filter();
  const totalProducts = await countFeatures.query.countDocuments();

  // Execute actual query with pagination, sorting, and field limiting
  const features = new APIFeatures(Product.find({ status: 'active' }), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query
    .populate('category', 'name slug')
    .populate('brand', 'name logo');

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;

  res.status(200).json({
    success: true,
    count: products.length,
    total: totalProducts,
    pages: Math.ceil(totalProducts / limit),
    currentPage: page,
    products
  });
});

/**
 * @desc    Get autocomplete search suggestions
 * @route   GET /api/v1/products/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res, next) => {
  const keyword = req.query.keyword;
  if (!keyword || keyword.trim() === '') {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const suggestions = await Product.find({
    title: { $regex: keyword.trim(), $options: 'i' },
    status: 'active'
  })
    .select('title slug thumbnail price')
    .limit(8);

  res.status(200).json({
    success: true,
    suggestions
  });
});

/**
 * @desc    Get product details by slug or ID + related products
 * @route   GET /api/v1/products/:slugOrId
 * @access  Public
 */
export const getProductBySlugOrId = asyncHandler(async (req, res, next) => {
  const query = req.params.slugOrId.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.slugOrId }
    : { slug: req.params.slugOrId };

  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('brand', 'name logo');

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Fetch related products (same category, excluding self)
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    status: 'active'
  })
    .limit(4)
    .select('title slug thumbnail price discountPrice rating reviewCount');

  res.status(200).json({
    success: true,
    product,
    relatedProducts
  });
});

/**
 * @desc    Create a product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    shortDescription,
    price,
    discountPrice,
    stock,
    SKU,
    category,
    brand,
    tags,
    featured,
    trending,
    bestSeller,
    newArrival,
    specifications,
    status
  } = req.body;

  // Validate Category & Brand exist
  const catExists = await Category.findById(category);
  if (!catExists) return next(new ErrorResponse('Invalid category ID', 400));

  const brandExists = await Brand.findById(brand);
  if (!brandExists) return next(new ErrorResponse('Invalid brand ID', 400));

  // Check SKU uniqueness
  const skuExists = await Product.findOne({ SKU });
  if (skuExists) return next(new ErrorResponse(`SKU code '${SKU}' is already in use`, 400));

  const slug = slugify(title);

  // Check unique slug
  const slugExists = await Product.findOne({ slug });
  if (slugExists) return next(new ErrorResponse(`Product with slug '${slug}' already exists`, 400));

  // Image uploads handler
  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadImage(file.path, 'products');
      images.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });
    }
  } else if (req.body.images && Array.isArray(req.body.images)) {
    // If sent as URL strings in body (mostly for seeding / dev setup)
    images = req.body.images;
  } else {
    // Fallback default image
    images.push({
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      publicId: 'default_product_img'
    });
  }

  const thumbnail = req.body.thumbnail || images[0].url;

  // Handle tags & specifications parsing if sent as JSON strings
  let parsedTags = tags;
  if (typeof tags === 'string') {
    try { parsedTags = JSON.parse(tags); } catch { parsedTags = tags.split(',').map(t => t.trim()); }
  }

  let parsedSpecs = specifications;
  if (typeof specifications === 'string') {
    try { parsedSpecs = JSON.parse(specifications); } catch { parsedSpecs = []; }
  }

  const product = await Product.create({
    title,
    slug,
    description,
    shortDescription,
    price,
    discountPrice: discountPrice || 0,
    stock,
    SKU,
    category,
    brand,
    images,
    thumbnail,
    tags: parsedTags || [],
    specifications: parsedSpecs || [],
    featured: featured === 'true' || featured === true,
    trending: trending === 'true' || trending === true,
    bestSeller: bestSeller === 'true' || bestSeller === true,
    newArrival: newArrival === 'true' || newArrival === true,
    status
  });

  res.status(201).json({
    success: true,
    product
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const bodyData = { ...req.body };

  // Generate new slug if title changes
  if (bodyData.title && bodyData.title !== product.title) {
    bodyData.slug = slugify(bodyData.title);
  }

  // Handle tags and specifications string to JSON parses
  if (typeof bodyData.tags === 'string') {
    try { bodyData.tags = JSON.parse(bodyData.tags); } catch { bodyData.tags = bodyData.tags.split(',').map(t => t.trim()); }
  }
  if (typeof bodyData.specifications === 'string') {
    try { bodyData.specifications = JSON.parse(bodyData.specifications); } catch { }
  }

  // Check Category & Brand if provided
  if (bodyData.category && bodyData.category !== product.category.toString()) {
    const catExists = await Category.findById(bodyData.category);
    if (!catExists) return next(new ErrorResponse('Invalid category ID', 400));
  }
  if (bodyData.brand && bodyData.brand !== product.brand.toString()) {
    const brandExists = await Brand.findById(bodyData.brand);
    if (!brandExists) return next(new ErrorResponse('Invalid brand ID', 400));
  }

  // Check SKU uniqueness
  if (bodyData.SKU && bodyData.SKU !== product.SKU) {
    const skuExists = await Product.findOne({ SKU: bodyData.SKU });
    if (skuExists) return next(new ErrorResponse(`SKU code '${bodyData.SKU}' is already in use`, 400));
  }

  // Handle file uploads if new images are provided
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const uploadResult = await uploadImage(file.path, 'products');
      images.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });
    }
    bodyData.images = images;
    bodyData.thumbnail = images[0].url;
  }

  product = await Product.findByIdAndUpdate(req.params.id, bodyData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    product
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});
