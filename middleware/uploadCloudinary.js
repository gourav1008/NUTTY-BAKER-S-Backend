import multer from 'multer';
import path from 'path';

/**
 * Multer Configuration for Cloudinary Integration
 * Uses memory storage to store files in buffer for streaming to Cloudinary
 * No local file storage needed - files go directly to cloud
 */

// ==================== MEMORY STORAGE ====================
// Memory storage - stores files in buffer (req.file.buffer)
// Files are kept in memory temporarily and then streamed to Cloudinary
const storage = multer.memoryStorage();

// ==================== FILE FILTERS ====================

/**
 * Image file filter
 * Validates file type and mimetype for images
 */
const imageFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

/**
 * Video file filter
 * Validates file type and mimetype for videos
 */
const videoFilter = (req, file, cb) => {
  // Allowed video types
  const allowedTypes = /mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (MP4, MOV, AVI, MKV, WebM)'));
  }
};

/**
 * Combined file filter for both images and videos
 * Validates file type for either image or video
 */
const combinedFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  const extname = path.extname(file.originalname).toLowerCase();
  
  const isImage = allowedImageTypes.test(extname) && file.mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && file.mimetype.startsWith('video/');

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('Only image (JPEG, PNG, GIF, WebP) and video (MP4, MOV, AVI, MKV, WebM) files are allowed'));
  }
};

// ==================== MULTER CONFIGURATIONS ====================

/**
 * Image upload configuration
 * Max size: 5MB
 * Allowed: JPEG, JPG, PNG, GIF, WebP
 */
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: imageFilter,
});

/**
 * Video upload configuration
 * Max size: 50MB
 * Allowed: MP4, MOV, AVI, MKV, WebM
 */
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: videoFilter,
});

/**
 * Combined upload configuration for both images and videos
 * Max size: 50MB (to accommodate videos)
 * Allowed: All image and video formats
 */
export const uploadCombined = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (max for videos)
  },
  fileFilter: combinedFilter,
});

/**
 * Multiple files upload configuration
 * For uploading multiple images at once
 */
export const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10, // Max 10 files
  },
  fileFilter: imageFilter,
});

// Default export for backward compatibility
export default uploadImage;
