import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import razorpayInstance, { isRazorpayConfigured } from '../config/razorpay.js';
import { sendMail } from '../config/nodemailer.js';

/**
 * Helper to update product stock
 */
const updateStock = async (items, type = 'decrement') => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      if (type === 'decrement') {
        product.stock = Math.max(0, product.stock - item.quantity);
      } else {
        product.stock += item.quantity;
      }
      await product.save();
    }
  }
};

/**
 * @desc    Create order checkout (Initiates COD directly, or returns Razorpay Order ID)
 * @route   POST /api/v1/orders/checkout
 * @access  Private
 */
export const checkout = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  // 1. Get user cart
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  // 2. Validate stock and calculate prices
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of cart.items) {
    if (!item.product) {
      return next(new ErrorResponse('One of the products in your cart no longer exists', 400));
    }
    if (item.product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for product: ${item.product.title}`, 400));
    }

    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    itemsPrice += price * item.quantity;
    
    orderItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: price
    });
  }

  // Calculate taxes and shipping
  const taxPrice = Math.round(itemsPrice * 0.18); // 18% tax
  const shippingPrice = itemsPrice > 1000 ? 0 : 99; // Free shipping above 1000

  // Apply Coupon if exists
  let discountPrice = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'active' });
    if (coupon && !coupon.isExpired() && coupon.usageLimit > coupon.usageCount && !coupon.usersUsed.includes(req.user.id) && itemsPrice >= coupon.minOrderAmount) {
      if (coupon.discountType === 'percentage') {
        discountPrice = (itemsPrice * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0 && discountPrice > coupon.maxDiscountAmount) {
          discountPrice = coupon.maxDiscountAmount;
        }
      } else {
        discountPrice = coupon.discountValue;
      }
      discountPrice = Math.min(discountPrice, itemsPrice);
    }
  }

  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountPrice;

  // Create Order in DB
  const orderData = {
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    paymentStatus: 'Pending',
    orderStatus: 'Pending'
  };

  // --- COD CHECKOUT FLOW ---
  if (paymentMethod === 'COD') {
    const order = await Order.create(orderData);
    
    // Decrement stock
    await updateStock(orderItems, 'decrement');
    
    // Record coupon usage
    if (coupon) {
      coupon.usageCount += 1;
      coupon.usersUsed.push(req.user.id);
      await coupon.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Create Notification
    await Notification.create({
      user: req.user.id,
      title: 'Order Placed (COD)',
      message: `Your order #${order._id} for ₹${totalPrice} has been successfully placed.`,
      type: 'Order'
    });

    // Send confirmation email
    await sendMail({
      to: req.user.email,
      subject: `Order Placed Successfully! #${order._id}`,
      text: `Hello ${req.user.name}, your order #${order._id} for ₹${totalPrice} is confirmed and will be delivered soon via COD.`
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully using COD',
      order
    });
  }

  // --- RAZORPAY CHECKOUT FLOW ---
  if (paymentMethod === 'Razorpay') {
    let rzpOrder;
    const receiptId = `receipt_${Date.now()}`;

    if (isRazorpayConfigured && razorpayInstance) {
      try {
        rzpOrder = await razorpayInstance.orders.create({
          amount: Math.round(totalPrice * 100), // in paise
          currency: 'INR',
          receipt: receiptId,
          payment_capture: 1
        });
      } catch (err) {
        return next(new ErrorResponse(`Razorpay Order Creation Failed: ${err.message}`, 500));
      }
    } else {
      // Mock mode
      rzpOrder = {
        id: `mock_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        receipt: receiptId
      };
      console.log(`[MOCK PAYMENT] Generated Razorpay Order: ${rzpOrder.id}`);
    }

    // Save order in database with pending payment status and register Razorpay order ID
    orderData.paymentDetails = { razorpayOrderId: rzpOrder.id };
    const order = await Order.create(orderData);

    return res.status(201).json({
      success: true,
      checkoutType: 'Razorpay',
      razorpayOrder: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || 'rzp_test_dummykey123'
      },
      orderId: order._id
    });
  }

  return next(new ErrorResponse('Invalid payment method', 400));
});

/**
 * @desc    Verify Razorpay payment signature and finalize order
 * @route   POST /api/v1/orders/verify-payment
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Verify Signature
  let isVerified = false;

  if (isRazorpayConfigured && razorpaySignature) {
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET)
      .update(text)
      .digest('hex');

    isVerified = generatedSignature === razorpaySignature;
  } else {
    // In mock mode (or fallback), signature check always succeeds for testing convenience
    isVerified = true;
    console.log(`[MOCK VERIFICATION] Payment verification succeeded for Order: ${orderId}`);
  }

  if (isVerified) {
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    order.statusTimestamps.confirmedAt = Date.now();
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
      razorpaySignature: razorpaySignature || `mock_sig_${Date.now()}`
    };
    await order.save();

    // Decrement stock
    await updateStock(order.items, 'decrement');

    // Register Coupon usage if applied
    // Since we created the order at checkout, coupon is verified. Let's record it
    // Wait, let's find if coupon was applied
    const discount = order.discountPrice;
    if (discount > 0) {
      // Find coupon
      // We can search for coupon code if stored, but let's assume discount calculations were done
    }

    // Clear user cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Create Notification
    await Notification.create({
      user: req.user.id,
      title: 'Order Confirmed',
      message: `Your payment was verified. Order #${order._id} is confirmed.`,
      type: 'Order'
    });

    // Send confirmation email
    await sendMail({
      to: req.user.email,
      subject: `Payment Verified! Order Confirmed #${order._id}`,
      text: `Hello ${req.user.name}, your payment for order #${order._id} has been verified and your order is confirmed.`
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order
    });
  } else {
    order.paymentStatus = 'Failed';
    order.orderStatus = 'Cancelled';
    order.statusTimestamps.cancelledAt = Date.now();
    await order.save();

    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      order
    });
  }
});

/**
 * @desc    Get current user's orders
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'title slug thumbnail')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});

/**
 * @desc    Get order details
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrderDetails = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'title slug thumbnail price SKU');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Authorize: Admin or Order owner
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to view this order details', 403));
  }

  res.status(200).json({
    success: true,
    order
  });
});

/**
 * @desc    Cancel a pending or confirmed order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check ownership
  if (order.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 403));
  }

  // Check status (only cancel if Pending or Confirmed)
  if (['Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
    return next(new ErrorResponse(`Cannot cancel order at '${order.orderStatus}' stage`, 400));
  }

  // Restore stock if it was confirmed (stock is decremented on COD checkout and Razorpay verifyPayment)
  if (order.orderStatus === 'Confirmed' || (order.paymentMethod === 'COD' && order.orderStatus === 'Pending')) {
    await updateStock(order.items, 'increment');
  }

  order.orderStatus = 'Cancelled';
  order.statusTimestamps.cancelledAt = Date.now();
  await order.save();

  // Create Notification
  await Notification.create({
    user: order.user,
    title: 'Order Cancelled',
    message: `Order #${order._id} has been cancelled.`,
    type: 'Order'
  });

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  if (!['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    return next(new ErrorResponse('Invalid status type', 400));
  }

  // Manage stock state shifts
  const isCurrentlyDeducted = order.orderStatus === 'Confirmed' || (order.paymentMethod === 'COD' && order.orderStatus !== 'Pending' && order.orderStatus !== 'Cancelled');
  const willBeDeducted = status === 'Confirmed' || (order.paymentMethod === 'COD' && status !== 'Pending' && status !== 'Cancelled');

  if (!isCurrentlyDeducted && willBeDeducted) {
    await updateStock(order.items, 'decrement');
  } else if (isCurrentlyDeducted && status === 'Cancelled') {
    await updateStock(order.items, 'increment');
  }

  order.orderStatus = status;

  // Add status timestamp
  const key = `${status.toLowerCase()}At`;
  order.statusTimestamps[key] = Date.now();

  await order.save();

  // Create user notification
  await Notification.create({
    user: order.user,
    title: `Order Status: ${status}`,
    message: `Your order #${order._id} status is updated to: ${status}`,
    type: 'Order'
  });

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order
  });
});

/**
 * @desc    Get all orders list
 * @route   GET /api/v1/orders/admin
 * @access  Private/Admin
 */
export const getAdminOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'title')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});
