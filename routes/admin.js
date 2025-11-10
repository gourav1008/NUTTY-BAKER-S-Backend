import express from 'express';
import { uploadImage, uploadVideo } from '../controllers/adminController.js';
import { protect as authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Protect admin routes with authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

// Upload endpoints
router.post('/upload-image', uploadImage);
router.post('/upload-video', uploadVideo);

export default router;
