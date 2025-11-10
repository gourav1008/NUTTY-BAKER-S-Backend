import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Upload file buffer to Cloudinary using streams
 * @param {Buffer} fileBuffer - File buffer from multer memory storage
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image buffer
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadImage = async (fileBuffer, folder = 'cakes/images') => {
  try {
    const result = await uploadToCloudinary(fileBuffer, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format (WebP if supported)
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload video to Cloudinary
 * @param {Buffer} fileBuffer - Video buffer
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadVideo = async (fileBuffer, folder = 'cakes/videos') => {
  try {
    const result = await uploadToCloudinary(fileBuffer, {
      folder: folder,
      resource_type: 'video',
      transformation: [
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error(`Video upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === 'ok') {
      console.log(`✅ Deleted ${resourceType} from Cloudinary:`, publicId);
      return { success: true, result };
    } else {
      console.warn(`⚠️ Failed to delete ${resourceType}:`, publicId, result);
      return { success: false, result };
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} files - Array of {publicId, resourceType}
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleFromCloudinary = async (files) => {
  try {
    const deletePromises = files.map(({ publicId, resourceType }) =>
      deleteFromCloudinary(publicId, resourceType)
    );

    const results = await Promise.allSettled(deletePromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple deletion error:', error);
    throw error;
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {String} publicId - Cloudinary public_id
 * @param {Object} transformations - Transformation options
 * @returns {String} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const {
    width = 800,
    height = 800,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = transformations;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: format },
    ],
    secure: true,
  });
};

/**
 * Generate video thumbnail URL
 * @param {String} publicId - Cloudinary video public_id
 * @param {Number} time - Time in seconds for thumbnail
 * @returns {String} - Thumbnail URL
 */
export const getVideoThumbnail = (publicId, time = 0) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { start_offset: time },
      { width: 400, height: 300, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'jpg' },
    ],
    secure: true,
  });
};

export default {
  uploadImage,
  uploadVideo,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedImageUrl,
  getVideoThumbnail,
};
