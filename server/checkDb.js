import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import User from './models/User.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const prodCount = await Product.countDocuments();
    const catCount = await Category.countDocuments();
    const brandCount = await Brand.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log({
      products: prodCount,
      categories: catCount,
      brands: brandCount,
      users: userCount
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

check();
