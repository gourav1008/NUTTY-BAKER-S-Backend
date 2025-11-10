import express from 'express';
import { register, login, getMe, updatePassword } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

// Admin only routes
router.post('/register', protect, adminOnly, register);

export default router;
