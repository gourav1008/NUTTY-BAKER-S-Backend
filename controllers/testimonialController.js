import Testimonial from '../models/Testimonial.js';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const { featured, approved = 'true', limit = 20, page = 1 } = req.query;

    // Build query - only show approved testimonials to public
    let query = {};
    
    if (approved === 'true') {
      query.isApproved = true;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const testimonials = await Testimonial.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Testimonial.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: testimonials.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        status: 'error',
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  try {
    const { name, email, rating, message, occasion, isApproved, featured, videoUrl } = req.body;

    // Handle uploaded image
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const testimonial = await Testimonial.create({
      name,
      email,
      rating: rating || 5,
      message,
      occasion,
      image,
      videoUrl,
      isApproved: isApproved === 'true' || isApproved === true || false,
      featured: featured === 'true' || featured === true || false
    });

    res.status(201).json({
      status: 'success',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res) => {
  try {
    let testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        status: 'error',
        message: 'Testimonial not found'
      });
    }

    // Handle new uploaded image
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        status: 'error',
        message: 'Testimonial not found'
      });
    }

    await testimonial.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Toggle testimonial approval
// @route   PATCH /api/testimonials/:id/approve
// @access  Private/Admin
export const toggleApproval = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        status: 'error',
        message: 'Testimonial not found'
      });
    }

    testimonial.isApproved = !testimonial.isApproved;
    await testimonial.save();

    res.status(200).json({
      status: 'success',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
