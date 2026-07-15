/**
 * Run this once to promote a user to Admin role.
 * Usage:  node makeAdmin.js your@email.com
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOneAndUpdate(
  { email },
  { role: 'Admin' },
  { new: true }
);

if (!user) {
  console.error(`No user found with email: ${email}`);
} else {
  console.log(`✅ ${user.name} (${user.email}) is now an Admin.`);
}

await mongoose.disconnect();
