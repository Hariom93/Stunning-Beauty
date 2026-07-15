import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY;
const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

const isRazorpayConfigured = 
  keyId && 
  keyId !== 'your_razorpay_key_id' &&
  keyId !== 'rzp_test_dummykey123';

let razorpayInstance = null;

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (error) {
    console.error('Failed to initialize Razorpay instance:', error.message);
  }
} else {
  console.log('Razorpay is running in Mock Mode (using dummy keys).');
}

export { isRazorpayConfigured };
export default razorpayInstance;
