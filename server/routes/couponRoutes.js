import express from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  applyCoupon
} from '../controllers/couponController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, couponSchema } from '../middlewares/validator.js';

const router = express.Router();

router.use(protect);

router.get('/', getCoupons);
router.post('/apply', applyCoupon);

// Admin-only routes
router.post('/', restrictTo('Admin'), validate(couponSchema), createCoupon);
router.delete('/:id', restrictTo('Admin'), deleteCoupon);

export default router;
