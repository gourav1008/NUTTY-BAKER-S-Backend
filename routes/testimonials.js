import express from 'express';
import {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleApproval
} from '../controllers/testimonialController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getTestimonials);
router.get('/:id', getTestimonial);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, upload.single('image'), createTestimonial);
router.put('/:id', protect, adminOnly, upload.single('image'), updateTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);
router.patch('/:id/approve', protect, adminOnly, toggleApproval);

export default router;
