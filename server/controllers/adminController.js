import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get Admin Dashboard Analytics (Counters, Charts, Recent items)
 * @route   GET /api/v1/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardAnalytics = asyncHandler(async (req, res, next) => {
  // 1. Total counters
  const totalUsers = await User.countDocuments({ role: 'Customer' });
  const totalProducts = await Product.countDocuments();
  
  // Confirmed/Paid orders count
  const validOrdersQuery = {
    orderStatus: { $ne: 'Cancelled' },
    $or: [{ paymentStatus: 'Paid' }, { paymentMethod: 'COD', orderStatus: { $nin: ['Pending', 'Cancelled'] } }]
  };
  const totalOrders = await Order.countDocuments(validOrdersQuery);

  // Revenue summation
  const revenueAggregation = await Order.aggregate([
    { $match: validOrdersQuery },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
  ]);
  const revenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

  // 2. Recent orders table data (top 6 orders)
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(6);

  // 3. Recent users table data (top 6 users)
  const recentUsers = await User.find({ role: 'Customer' })
    .sort('-createdAt')
    .limit(6)
    .select('name email isVerified createdAt avatar');

  // 4. Category sales percentage chart (aggregate orders -> products -> categories)
  const categorySales = await Order.aggregate([
    { $match: validOrdersQuery },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productDetails.category',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    { $unwind: '$categoryDetails' },
    {
      $group: {
        _id: '$categoryDetails.name',
        salesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $project: { name: '$_id', value: '$salesAmount', _id: 0 } }
  ]);

  // 5. Monthly Sales chart statistics (last 6 months)
  const monthlySales = await Order.aggregate([
    { $match: validOrdersQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
    {
      $project: {
        month: {
          $concat: [
            {
              $arrayElemAt: [
                ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                '$_id.month'
              ]
            },
            ' ',
            { $substr: ['$_id.year', 2, 2] }
          ]
        },
        revenue: 1,
        orders: 1,
        _id: 0
      }
    }
  ]);

  // Reverse to make it left-to-right chronological
  monthlySales.reverse();

  res.status(200).json({
    success: true,
    analytics: {
      counters: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue
      },
      recentOrders,
      recentUsers,
      categorySales,
      monthlySales
    }
  });
});

/**
 * @desc    Get all users list (Admin view)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAdminUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().sort('-createdAt');
  res.status(200).json({
    success: true,
    users
  });
});

/**
 * @desc    Toggle admin/customer role
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const toggleUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Prevent self demoting
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot change your own role', 400));
  }

  user.role = user.role === 'Admin' ? 'Customer' : 'Admin';
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User role changed to ${user.role}`,
    user
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot delete your own account', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// --- ADMIN BANNER CONTROLLERS ---

/**
 * @desc    Get all banners (Admin view, includes inactive)
 * @route   GET /api/v1/admin/banners
 * @access  Private/Admin
 */
export const getAdminBanners = asyncHandler(async (req, res, next) => {
  const banners = await Banner.find();
  res.status(200).json({
    success: true,
    banners
  });
});

/**
 * @desc    Create banner
 * @route   POST /api/v1/admin/banners
 * @access  Private/Admin
 */
export const createBanner = asyncHandler(async (req, res, next) => {
  const { title, subtitle, image, link, position, status } = req.body;

  const banner = await Banner.create({
    title,
    subtitle,
    image,
    link,
    position,
    status
  });

  res.status(201).json({
    success: true,
    banner
  });
});

/**
 * @desc    Toggle banner status
 * @route   PUT /api/v1/admin/banners/:id/status
 * @access  Private/Admin
 */
export const toggleBannerStatus = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  banner.status = banner.status === 'active' ? 'inactive' : 'active';
  await banner.save();

  res.status(200).json({
    success: true,
    message: `Banner status set to ${banner.status}`,
    banner
  });
});

/**
 * @desc    Delete banner
 * @route   DELETE /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  await Banner.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Banner deleted successfully'
  });
});
