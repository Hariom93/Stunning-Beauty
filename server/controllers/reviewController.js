import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Submit a review for a product
 * @route   POST /api/v1/reviews/:productId
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, title } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if user has already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: req.user.id,
    product: productId
  });

  if (alreadyReviewed) {
    return next(new ErrorResponse('You have already reviewed this product. You can delete your existing review to submit a new one.', 400));
  }

  // Check if user has verified purchase of this product
  const purchasedOrder = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    orderStatus: 'Delivered'
  });

  const verifiedPurchase = !!purchasedOrder;

  const review = await Review.create({
    user: req.user.id,
    product: productId,
    title: title || '',
    comment,
    rating: Number(rating),
    verifiedPurchase
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review
  });
});

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/v1/reviews/:productId
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Authorize deletion: Admin or Review creator
  if (review.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});
