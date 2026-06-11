import express from 'express';
import {
  getUsers,
  updateUserStatus,
  deleteUser,
  getActivityLogs,
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce JWT validation
router.use(protect);

router.get('/users', authorize('admin', 'staff'), getUsers);
router.put('/users/:id', authorize('admin'), updateUserStatus);
router.delete('/users/:id', authorize('admin'), deleteUser);
router.get('/logs', authorize('admin'), getActivityLogs);
router.get('/settings', authorize('admin'), getSystemSettings);
router.put('/settings', authorize('admin'), updateSystemSettings);

export default router;
