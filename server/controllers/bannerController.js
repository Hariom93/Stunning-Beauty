import Banner from '../models/Banner.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get active banners for carousel slider
 * @route   GET /api/v1/banners
 * @access  Public
 */
export const getActiveBanners = asyncHandler(async (req, res, next) => {
  const banners = await Banner.find({ status: 'active' });
  res.status(200).json({
    success: true,
    banners
  });
});
