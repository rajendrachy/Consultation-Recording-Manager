import { cloudinary, configureCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

const isCloudinaryActive = configureCloudinary();

/**
 * Uploads a file to Cloudinary or falls back to local storage
 * @param {string} filePath - Path to the local file
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<{url: string, publicId: string|null}>}
 */
export const uploadFile = async (filePath, folder = 'consultation_recordings') => {
  try {
    if (isCloudinaryActive) {
      console.log(`Uploading ${filePath} to Cloudinary folder '${folder}'...`);
      try {
        const response = await cloudinary.uploader.upload(filePath, {
          folder: folder,
          resource_type: 'auto', // Auto detects audio/video/image
        });

        // Cleanup local temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return {
          url: response.secure_url,
          publicId: response.public_id,
        };
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local storage engine:', cloudinaryError.message || cloudinaryError);
        const filename = path.basename(filePath);
        return {
          url: `/uploads/${filename}`,
          publicId: null,
        };
      }
    } else {
      console.log(`Using local storage engine fallback for ${filePath}`);
      const filename = path.basename(filePath);
      
      // Return relative path. The server will host 'uploads' as static assets.
      return {
        url: `/uploads/${filename}`,
        publicId: null,
      };
    }
  } catch (error) {
    console.error('Storage Upload Error:', error);
    // Cleanup local temp file if it exists
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Could not clean up temp file:', e.message);
      }
    }
    throw error;
  }
};

/**
 * Deletes a file from Cloudinary or local file system
 * @param {string|null} publicId - Cloudinary public ID
 * @param {string|null} fileUrl - File URL (for local delete fallback)
 */
export const deleteFile = async (publicId, fileUrl = null) => {
  try {
    if (publicId && isCloudinaryActive) {
      console.log(`Deleting ${publicId} from Cloudinary...`);
      // Cloudinary handles video/audio delete via resource_type: 'video' or 'raw'
      // We check if it is a video/audio and delete accordingly.
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    } else if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(fileUrl);
      const filePath = path.join('./uploads', filename);

      if (fs.existsSync(filePath)) {
        console.log(`Deleting local fallback file ${filePath}...`);
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Storage Deletion Error:', error.message);
  }
};
