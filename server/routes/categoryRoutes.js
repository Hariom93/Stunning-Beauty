import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, categorySchema } from '../middlewares/validator.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin-only routes
router.post('/', protect, restrictTo('Admin'), validate(categorySchema), createCategory);
router.put('/:id', protect, restrictTo('Admin'), validate(categorySchema), updateCategory);
router.delete('/:id', protect, restrictTo('Admin'), deleteCategory);

export default router;
