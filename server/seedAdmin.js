/**
 * Admin Seed Script
 * ─────────────────────────────────────────────────────────
 * Creates a default Admin account in MongoDB if it doesn't
 * already exist.
 *
 * Usage:
 *   node seedAdmin.js
 *
 * Credentials:
 *   Email    : admin@gmail.com
 *   Password : Admin@123
 *   Role     : Admin
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const ADMIN = {
  name: 'Super Admin',
  email: 'admin@gmail.com',
  password: 'Admin@123',
  role: 'Admin',
  isVerified: true,       // skip email verification step
  phone: '9999999999',
  avatar: {
    url: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=150',
    publicId: 'admin_default_avatar',
  },
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      // Reset credentials to ensure clean state and correct single-hashed password
      existing.name = ADMIN.name;
      existing.password = ADMIN.password; // pre-save hook will hash it once
      existing.role = ADMIN.role;
      existing.isVerified = true;
      await existing.save();
      console.log(`⚡ Existing account (${ADMIN.email}) credentials reset successfully (password hashed once).`);
    } else {
      await User.create({
        name: ADMIN.name,
        email: ADMIN.email,
        password: ADMIN.password, // pre-save hook will hash it once
        role: ADMIN.role,
        isVerified: ADMIN.isVerified,
        phone: ADMIN.phone,
        avatar: ADMIN.avatar,
      });

      console.log('');
      console.log('🎉 Admin account created successfully!');
      console.log('─────────────────────────────────────');
      console.log(`   Email    : ${ADMIN.email}`);
      console.log(`   Password : ${ADMIN.password}`);
      console.log(`   Role     : ${ADMIN.role}`);
      console.log('─────────────────────────────────────');
      console.log('');
    }
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seed();
