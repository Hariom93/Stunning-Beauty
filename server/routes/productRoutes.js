import express from 'express';
import {
  getProducts,
  getSearchSuggestions,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';
import { validate, productSchema } from '../middlewares/validator.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/:slugOrId', getProductBySlugOrId);

// Admin-only routes
router.post(
  '/',
  protect,
  restrictTo('Admin'),
  upload.array('images', 5),
  validate(productSchema),
  createProduct
);

router.put(
  '/:id',
  protect,
  restrictTo('Admin'),
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, restrictTo('Admin'), deleteProduct);

export default router;
