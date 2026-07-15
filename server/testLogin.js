import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    if (!user) {
      console.log('User not found!');
      return;
    }

    console.log('User found:', user.email);
    console.log('Hashed password in DB:', user.password);

    const match = await bcrypt.compare('Admin@123', user.password);
    console.log('Does "Admin@123" match user.password?', match);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

test();
