import express from 'express';
import { getStats, getPortfolioAnalytics } from '../controllers/statsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (Admin only)
router.get('/', protect, adminOnly, getStats);
router.get('/portfolio', protect, adminOnly, getPortfolioAnalytics);

export default router;
