import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';

// Import configs
import connectDB from './config/db.js';

// Import middlewares
import errorHandler from './middlewares/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import addressRoutes from './routes/addressRoutes.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- SECURITY MIDDLEWARES ---

// Set secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images from Cloudinary/local storage on client
}));

// CORS Configuration
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null;
const allowedOrigins = [
  clientUrl,
  'https://stunning-beauty1.vercel.app',
  'https://mern-ecommerce-psi-two.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow if exact match, matches localhost port, matches LAN IP, or matches vercel.app domains
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/(192\.168|10\.)/.test(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allows setting cookies in client browser
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize MongoDB queries to prevent NoSQL injection
app.use(mongoSanitize());

// Custom XSS Sanitizer middleware (strips script tags from body inputs)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Basic stripping of HTML tags
          obj[key] = obj[key].replace(/<[^>]*>/g, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
});

// Rate limiting to prevent DOS / API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// --- STATIC ASSETS ---
// Serve local uploads folder for static access
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// --- ROUTE MOUNTING ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/addresses', addressRoutes);

// Fallback for API routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API Route not found: ${req.originalUrl}`
  });
});

// Centralized error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g. database disconnect)
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
