import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config({ path: './server/.env' });

const runTest = async () => {
  try {
    // 1. Connect to DB to fetch credentials & products
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get a seeded customer or admin user
    const user = await User.findOne({ email: 'admin@gmail.com' });
    if (!user) {
      console.error('❌ User admin@gmail.com not found. Run seedAdmin.js or seed.js first.');
      process.exit(1);
    }

    // Get a seeded product
    const product = await Product.findOne({ status: 'active' });
    if (!product) {
      console.error('❌ No active products found in DB. Run seed.js first.');
      process.exit(1);
    }
    console.log(`📦 Found test product in DB: "${product.title}" (${product._id})`);

    // Disconnect DB to allow http client requests cleanly
    await mongoose.disconnect();

    // 2. Perform HTTP Login to retrieve access token
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@gmail.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.accessToken;
    console.log('🔑 Logged in successfully. Token acquired.');

    // 3. Clear existing cart
    await axios.delete('http://localhost:5000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('🗑️  Cart cleared successfully.');

    // 4. Test POST /api/v1/cart (add item)
    console.log(`🚀 Sending POST /api/v1/cart adding product ${product._id}...`);
    const postRes = await axios.post('http://localhost:5000/api/v1/cart', {
      productId: product._id.toString(),
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✨ Response status: ${postRes.status} ${postRes.statusText}`);
    console.log('Response body:', JSON.stringify(postRes.data, null, 2));

    if (postRes.status === 200) {
      console.log('🎉 SUCCESS: POST /api/v1/cart returns 200 instead of 404!');
    } else {
      console.error(`❌ FAILED: Unexpected status code: ${postRes.status}`);
    }

  } catch (err) {
    console.error('❌ Error occurred during verification:', err.response?.data || err.message);
  }
};

runTest();
