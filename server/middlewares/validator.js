import ErrorResponse from '../utils/errorResponse.js';

/**
 * Higher-order middleware to run custom validation checks.
 */
export const validate = (schemaFn) => {
  return (req, res, next) => {
    const errors = schemaFn(req.body);
    if (Object.keys(errors).length > 0) {
      const errorMsg = Object.values(errors).join(', ');
      return next(new ErrorResponse(errorMsg, 400));
    }
    next();
  };
};

// --- AUTH VALIDATION SCHEMAS ---

export const registerSchema = (data) => {
  const errors = {};
  if (!data.name || data.name.trim() === '') errors.name = 'Name is required';
  if (!data.email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  return errors;
};

export const loginSchema = (data) => {
  const errors = {};
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  return errors;
};

export const resetPasswordSchema = (data) => {
  const errors = {};
  if (!data.password || data.password.length < 6) {
    errors.password = 'New password must be at least 6 characters long';
  }
  return errors;
};

// --- CATALOG VALIDATION SCHEMAS ---

export const productSchema = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') errors.title = 'Product title is required';
  if (!data.description || data.description.trim() === '') errors.description = 'Product description is required';
  if (data.price === undefined || data.price < 0) errors.price = 'Product price must be a positive number';
  if (data.stock === undefined || data.stock < 0) errors.stock = 'Product stock must be 0 or more';
  if (!data.category) errors.category = 'Category ID is required';
  if (!data.brand) errors.brand = 'Brand ID is required';
  return errors;
};

export const categorySchema = (data) => {
  const errors = {};
  if (!data.name || data.name.trim() === '') errors.name = 'Category name is required';
  return errors;
};

export const brandSchema = (data) => {
  const errors = {};
  if (!data.name || data.name.trim() === '') errors.name = 'Brand name is required';
  return errors;
};

// --- COUPON VALIDATION SCHEMAS ---

export const couponSchema = (data) => {
  const errors = {};
  if (!data.code || data.code.trim() === '') errors.code = 'Coupon code is required';
  if (!data.discountType || !['percentage', 'fixed'].includes(data.discountType)) {
    errors.discountType = "Discount type must be either 'percentage' or 'fixed'";
  }
  if (data.discountValue === undefined || data.discountValue <= 0) {
    errors.discountValue = 'Discount value must be greater than 0';
  }
  if (!data.expiryDate) errors.expiryDate = 'Expiry date is required';
  return errors;
};
