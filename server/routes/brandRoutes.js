import express from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, brandSchema } from '../middlewares/validator.js';

const router = express.Router();

router.get('/', getBrands);

router.post('/', protect, restrictTo('Admin'), validate(brandSchema), createBrand);
router.put('/:id', protect, restrictTo('Admin'), validate(brandSchema), updateBrand);
router.delete('/:id', protect, restrictTo('Admin'), deleteBrand);

export default router;
