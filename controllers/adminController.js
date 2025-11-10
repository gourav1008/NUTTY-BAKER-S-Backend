import multer from 'multer';
import { uploadImage as uploadImageMiddleware, uploadVideo as uploadVideoMiddleware } from '../middleware/uploadCloudinary.js';
import { uploadImage as cloudinaryUploadImage, uploadVideo as cloudinaryUploadVideo } from '../utils/cloudinaryUpload.js';

/**
 * Upload image to Cloudinary
 * @route POST /api/admin/upload-image
 * @access Private/Admin
 */
export const uploadImage = async (req, res) => {
  try {
    // Use multer middleware to handle file upload to memory
    uploadImageMiddleware.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            status: 'error',
            message: 'Image file too large. Maximum size is 5MB' 
          });
        }
        return res.status(400).json({ 
          status: 'error',
          message: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          status: 'error',
          message: 'No image file uploaded' 
        });
      }

      try {
        // Upload to Cloudinary
        console.log('📤 Uploading image to Cloudinary...');
        const result = await cloudinaryUploadImage(req.file.buffer, 'cakes/images');

        console.log('✅ Image uploaded successfully:', result.publicId);

        // Return success response with Cloudinary details
        res.status(200).json({
          status: 'success',
          message: 'Image uploaded successfully to Cloudinary',
          file: {
            url: result.url,
            publicId: result.publicId,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: result.size,
            width: result.width,
            height: result.height,
            format: result.format
          }
        });
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        res.status(500).json({
          status: 'error',
          message: 'Failed to upload image to Cloudinary',
          error: uploadError.message
        });
      }
    });
  } catch (error) {
    console.error('❌ Upload image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during image upload',
      error: error.message
    });
  }
};

/**
 * Upload video to Cloudinary
 * @route POST /api/admin/upload-video
 * @access Private/Admin
 */
export const uploadVideo = async (req, res) => {
  try {
    // Use multer middleware to handle file upload to memory
    uploadVideoMiddleware.single('video')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            status: 'error',
            message: 'Video file too large. Maximum size is 50MB' 
          });
        }
        return res.status(400).json({ 
          status: 'error',
          message: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          status: 'error',
          message: 'No video file uploaded' 
        });
      }

      try {
        // Upload to Cloudinary
        console.log('📤 Uploading video to Cloudinary...');
        const result = await cloudinaryUploadVideo(req.file.buffer, 'cakes/videos');

        console.log('✅ Video uploaded successfully:', result.publicId);

        // Return success response with Cloudinary details
        res.status(200).json({
          status: 'success',
          message: 'Video uploaded successfully to Cloudinary',
          file: {
            url: result.url,
            publicId: result.publicId,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: result.size,
            duration: result.duration,
            width: result.width,
            height: result.height,
            format: result.format
          }
        });
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        res.status(500).json({
          status: 'error',
          message: 'Failed to upload video to Cloudinary',
          error: uploadError.message
        });
      }
    });
  } catch (error) {
    console.error('❌ Upload video error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during video upload',
      error: error.message
    });
  }
};

export default { uploadImage, uploadVideo };
