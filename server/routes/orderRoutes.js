import express from 'express';
import {
  checkout,
  verifyPayment,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
  getAdminOrders
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect to all order endpoints
router.use(protect);

router.post('/checkout', checkout);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', getMyOrders);

// Admin-only endpoints
router.get('/admin', restrictTo('Admin'), getAdminOrders);
router.put('/:id/status', restrictTo('Admin'), updateOrderStatus);

// Details & Cancel
router.route('/:id')
  .get(getOrderDetails)
  .put(cancelOrder);

export default router;
