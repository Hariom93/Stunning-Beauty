import express from 'express';
import {
  getDashboardAnalytics,
  getAdminUsers,
  toggleUserRole,
  deleteUser,
  getAdminBanners,
  createBanner,
  toggleBannerStatus,
  deleteBanner
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply Admin protections to all routes in this subrouter
router.use(protect);
router.use(restrictTo('Admin'));

router.get('/dashboard', getDashboardAnalytics);

router.route('/users')
  .get(getAdminUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/role', toggleUserRole);

router.route('/banners')
  .get(getAdminBanners)
  .post(createBanner);

router.route('/banners/:id')
  .delete(deleteBanner);

router.put('/banners/:id/status', toggleBannerStatus);

export default router;
