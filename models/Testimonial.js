import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
    default: 5
  },
  message: {
    type: String,
    required: [true, 'Please provide a testimonial message']
  },
  occasion: {
    type: String,
    enum: ['Wedding', 'Birthday', 'Anniversary', 'Corporate Event', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for filtering
testimonialSchema.index({ isApproved: 1, featured: -1, createdAt: -1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
