import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate('products', 'title slug price discountPrice stock thumbnail rating reviewCount');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  res.status(200).json({
    success: true,
    wishlist
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist/:productId
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  if (wishlist.products.includes(productId)) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      wishlist
    });
  }

  wishlist.products.push(productId);
  await wishlist.save();
  await wishlist.populate('products', 'title slug price discountPrice stock thumbnail rating reviewCount');

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    wishlist
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();
  await wishlist.populate('products', 'title slug price discountPrice stock thumbnail rating reviewCount');

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    wishlist
  });
});

/**
 * @desc    Move item from wishlist to cart
 * @route   POST /api/v1/wishlist/:productId/move-to-cart
 * @access  Private
 */
export const moveToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // 1. Verify product and check stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  if (product.stock <= 0) {
    return next(new ErrorResponse('Product is currently out of stock', 400));
  }

  // 2. Remove from wishlist
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
  }

  // 3. Add to cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();

  // Retrieve fully populated structures
  const updatedWishlist = await Wishlist.findOne({ user: req.user.id })
    .populate('products', 'title slug price discountPrice stock thumbnail rating');
  const updatedCart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'title slug price discountPrice stock thumbnail');

  res.status(200).json({
    success: true,
    message: 'Moved product to cart',
    wishlist: updatedWishlist,
    cart: updatedCart
  });
});
