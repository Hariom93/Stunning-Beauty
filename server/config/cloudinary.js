import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Configure Cloudinary only if keys are provided and not dummy values
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_NAME && 
  process.env.CLOUDINARY_NAME !== 'your_cloudinary_name' &&
  process.env.CLOUDINARY_NAME !== 'demo';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });
}

const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  return 'http://localhost:5000';
};

/**
 * Upload helper that handles Cloudinary upload,
 * falling back to a local URL / dummy image if Cloudinary credentials are not set.
 */
export const uploadImage = async (filePath, folder = 'ecommerce') => {
  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto'
      });
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } else {
      console.warn('Cloudinary not configured. Returning local uploads URL.');
      const filename = path.basename(filePath);
      return {
        url: `${getBackendUrl()}/uploads/${filename}`,
        publicId: `local_${filename}`
      };
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    if (filePath) {
      const filename = path.basename(filePath);
      return {
        url: `${getBackendUrl()}/uploads/${filename}`,
        publicId: `local_fallback_${filename}`
      };
    }
    // Graceful fallback
    return {
      url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80`,
      publicId: `mock_public_id_fallback_${Date.now()}`
    };
  }
};

export default cloudinary;
