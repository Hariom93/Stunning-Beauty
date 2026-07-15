import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get current user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'title slug price discountPrice stock thumbnail');

  if (!cart) {
    // Fallback: Create cart if it doesn't exist for some reason
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({
    success: true,
    cart
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity, selectedAttributes } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} items left in stock`, 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Check if item already exists in cart with same attributes
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // If it exists, update quantity
    const newQty = cart.items[existingItemIndex].quantity + (quantity || 1);
    if (product.stock < newQty) {
      return next(new ErrorResponse(`Cannot add more items. Max available stock is ${product.stock}`, 400));
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    // If it doesn't exist, push new item
    cart.items.push({
      product: productId,
      quantity: quantity || 1,
      selectedAttributes: selectedAttributes || {}
    });
  }

  await cart.save();
  
  // Populate details to send back
  await cart.populate('items.product', 'title slug price discountPrice stock thumbnail');

  res.status(200).json({
    success: true,
    message: 'Product added to cart',
    cart
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/:itemId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const item = cart.items.find((item) => item.product.toString() === req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  const product = await Product.findById(item.product);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} items left in stock`, 400));
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'title slug price discountPrice stock thumbnail');

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    cart
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/:itemId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Filter out item by product ID
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.itemId);

  await cart.save();
  await cart.populate('items.product', 'title slug price discountPrice stock thumbnail');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart
  });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $set: { items: [] } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    cart
  });
});
