import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  occasionType: {
    type: String,
    enum: ['Wedding', 'Birthday', 'Anniversary', 'Corporate Event', 'Custom Order', 'General Inquiry', 'Other'],
    default: 'General Inquiry'
  },
  eventDate: {
    type: Date
  },
  message: {
    type: String,
    required: [true, 'Please provide a message']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for filtering and sorting
contactSchema.index({ status: 1, createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
