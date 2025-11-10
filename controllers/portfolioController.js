import Portfolio from '../models/Portfolio.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

/**
 * Helper function to delete images from Cloudinary
 * @param {Array} images - Array of image objects with publicId
 */
const deleteCloudinaryImages = async (images) => {
  if (!images || images.length === 0) return;
  
  const deletePromises = images
    .filter(img => img.publicId)
    .map(async (img) => {
      try {
        await cloudinary.uploader.destroy(img.publicId);
        console.log(`🗑️ Deleted from Cloudinary: ${img.publicId}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${img.publicId}:`, error.message);
      }
    });
  
  await Promise.all(deletePromises);
};

// @desc    Get all portfolio items
// @route   GET /api/portfolio
// @access  Public
export const getPortfolioItems = async (req, res) => {
  try {
    const { category, featured, search, sort = '-createdAt', limit = 50, page = 1 } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const items = await Portfolio.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Portfolio.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: items
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single portfolio item
// @route   GET /api/portfolio/:id
// @access  Public
export const getPortfolioItem = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Portfolio item not found'
      });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.status(200).json({
      status: 'success',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create portfolio item
// @route   POST /api/portfolio
// @access  Private/Admin
export const createPortfolioItem = async (req, res) => {
  try {

    console.log('📝 CREATE PORTFOLIO - Request received');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📁 Request files:', req.files);
    console.log('Video:', req.body.video);
    
    const { title, description, category, price, tags, featured, servings, preparationTime } = req.body;

    // Validate required fields
    if (!title || !description || !category || !price) {
      console.error('❌ Missing required fields:', { title: !!title, description: !!description, category: !!category, price: !!price });
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: title, description, category, and price are required'
      });
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      console.log('📸 Processing uploaded files...');
      // Separate images from uploaded files
      const imageFiles = req.files.filter(file => file.mimetype.startsWith('image/'));
      
      // Upload each image to Cloudinary
      const uploadPromises = imageFiles.map(async (file) => {
        try {
          console.log(`☁️ Uploading ${file.filename} to Cloudinary...`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'nutty-bakers/portfolio',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          });
          
          // Delete local file after successful upload
          await fs.unlink(file.path);
          console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
          
          return {
            url: result.secure_url,
            publicId: result.public_id,
            alt: title
          };
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${file.filename}:`, uploadError.message);
          // Delete local file even if upload fails
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete local file:', unlinkError.message);
          }
          throw uploadError;
        }
      });
      
      images = await Promise.all(uploadPromises);
      console.log(`✅ Processed ${images.length} uploaded images to Cloudinary`);
    } else {
      console.log('📸 Processing image URLs from form data...');
      // Handle images sent as form fields (e.g., images[0][url], images[0][alt])
      images = [];
      const imageKeys = Object.keys(req.body).filter(key => key.startsWith('images['));

      if (imageKeys.length > 0) {
        console.log(`📋 Found ${imageKeys.length} image field keys`);
        const imageMap = {};

        imageKeys.forEach(key => {
          const match = key.match(/images\[(\d+)\]\[(\w+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];

            if (!imageMap[index]) {
              imageMap[index] = {};
            }
            imageMap[index][field] = req.body[key];
          }
        });

        // Convert map to array and filter out empty URLs
        images = Object.values(imageMap).filter(img => img.url && img.url.trim() !== '');
        console.log(`✅ Processed ${images.length} images from form fields:`, images);
      } else if (req.body.images) {
        console.log('📋 Parsing images from JSON string...');
        try {
          images = JSON.parse(req.body.images);
          console.log(`✅ Parsed ${images.length} images from JSON`);
        } catch (parseError) {
          console.error('❌ Failed to parse images JSON:', parseError.message);
          images = [];
        }
      }
    }

    // Validate images
    if (!images || images.length === 0) {
      console.error('❌ No valid images provided');
      return res.status(400).json({
        status: 'error',
        message: 'At least one image is required'
      });
    }

    // Handle video data from request body (video is uploaded separately via admin API)
    let video = null;
    if (req.body.video) {
      console.log('🎥 Processing video data...');
      try {
        video = typeof req.body.video === 'string' ? JSON.parse(req.body.video) : req.body.video;
        console.log('✅ Video data processed:', video);
      } catch (e) {
        console.error('⚠️ Failed to parse video data:', e.message);
        video = null;
      }
    }

    // Prepare data for MongoDB
    const portfolioData = {
      title,
      description,
      category,
      price: parseFloat(price),
      images,
      video,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      featured: featured === 'true' || featured === true,
      servings: servings || 'Varies',
      preparationTime: preparationTime || '2-3 days'
    };

    console.log('💾 Creating portfolio item with data:', JSON.stringify(portfolioData, null, 2));

    const item = await Portfolio.create(portfolioData);

    console.log('✅ Portfolio item created successfully:', item._id);

    res.status(201).json({
      status: 'success',
      message: 'Portfolio item created successfully',
      data: item
    });
  } catch (error) {
    console.error('❌ CREATE PORTFOLIO ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'A portfolio item with this data already exists'
      });
    }

    // Generic error
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error while creating portfolio item',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private/Admin
export const updatePortfolioItem = async (req, res) => {
  try {
    let item = await Portfolio.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Portfolio item not found'
      });
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter(file => file.mimetype.startsWith('image/'));
      
      // Upload each image to Cloudinary
      const uploadPromises = imageFiles.map(async (file) => {
        try {
          console.log(`☁️ Uploading ${file.filename} to Cloudinary...`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'nutty-bakers/portfolio',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          });
          
          // Delete local file after successful upload
          await fs.unlink(file.path);
          console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
          
          return {
            url: result.secure_url,
            publicId: result.public_id,
            alt: req.body.title || item.title
          };
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${file.filename}:`, uploadError.message);
          // Delete local file even if upload fails
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete local file:', unlinkError.message);
          }
          throw uploadError;
        }
      });
      
      const newImages = await Promise.all(uploadPromises);
      req.body.images = [...(item.images || []), ...newImages];
    } else {
      // Handle images sent as form fields (e.g., images[0][url], images[0][alt])
      const imageKeys = Object.keys(req.body).filter(key => key.startsWith('images['));

      if (imageKeys.length > 0) {
        const imageMap = {};

        imageKeys.forEach(key => {
          const match = key.match(/images\[(\d+)\]\[(\w+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];

            if (!imageMap[index]) {
              imageMap[index] = {};
            }
            imageMap[index][field] = req.body[key];
          }
        });

        // Convert map to array and filter out empty URLs
        req.body.images = Object.values(imageMap).filter(img => img.url && img.url.trim() !== '');
      }
    }

    // Handle video data from request body
    if (req.body.video) {
      try {
        req.body.video = typeof req.body.video === 'string' ? JSON.parse(req.body.video) : req.body.video;
      } catch (e) {
        // If parsing fails, keep existing video
        delete req.body.video;
      }
    }

    // Handle tags
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    item = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private/Admin
export const deletePortfolioItem = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Portfolio item not found'
      });
    }

    // Delete images from Cloudinary before deleting the item
    if (item.images && item.images.length > 0) {
      console.log(`🗑️ Deleting ${item.images.length} images from Cloudinary...`);
      await deleteCloudinaryImages(item.images);
    }

    // Delete video from Cloudinary if exists
    if (item.video && item.video.publicId) {
      try {
        await cloudinary.uploader.destroy(item.video.publicId, { resource_type: 'video' });
        console.log(`🗑️ Deleted video from Cloudinary: ${item.video.publicId}`);
      } catch (error) {
        console.error('Failed to delete video:', error.message);
      }
    }

    await item.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get portfolio categories
// @route   GET /api/portfolio/categories/list
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Portfolio.distinct('category');
    
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
