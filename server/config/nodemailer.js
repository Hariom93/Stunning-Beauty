import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isMailConfigured = 
  process.env.EMAIL_USER && 
  process.env.EMAIL_USER !== 'your_email@gmail.com' &&
  process.env.EMAIL_USER !== 'username';

let transporter;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Send email helper with console logging fallback for development
 */
export const sendMail = async ({ to, subject, html, text }) => {
  try {
    if (isMailConfigured && transporter) {
      const mailOptions = {
        from: `"E-Commerce Nest" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } else {
      console.log('==================================================');
      console.log(`[MOCK EMAIL SENT]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (Text): ${text || 'N/A'}`);
      console.log(`Body (HTML length): ${html ? html.length : 0} characters`);
      console.log('==================================================');
      return { messageId: `mock_email_${Date.now()}` };
    }
  } catch (error) {
    console.error('Nodemailer Error sending mail:', error.message);
    // Silent fail in dev, return a mock success so authentication routes don't crash
    return { messageId: `mock_email_error_${Date.now()}` };
  }
};

export default transporter;
