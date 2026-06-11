import express from 'express';
import {
  getDashboardStats,
  getFullAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Analytics endpoints require authentication
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/reports', getFullAnalytics);

export default router;
