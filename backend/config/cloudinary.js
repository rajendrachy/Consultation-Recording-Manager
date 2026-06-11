import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== 'your_cloudinary_cloud_name' &&
    apiKey !== 'your_cloudinary_api_key' &&
    apiSecret !== 'your_cloudinary_api_secret'
  ) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log('Cloudinary storage engine initialized.');
    return true;
  }

  console.log('Cloudinary credentials missing/default. Falling back to local storage engine.');
  return false;
};

export { cloudinary, configureCloudinary };
