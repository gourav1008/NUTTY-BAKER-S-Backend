import express from 'express';
import {
  getPortfolioItems,
  getPortfolioItem,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getCategories
} from '../controllers/portfolioController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getPortfolioItems);
router.get('/categories/list', getCategories);
router.get('/:id', getPortfolioItem);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, upload.array('images', 5), createPortfolioItem);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updatePortfolioItem);
router.delete('/:id', protect, adminOnly, deletePortfolioItem);

export default router;
