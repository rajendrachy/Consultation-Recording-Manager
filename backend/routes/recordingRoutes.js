import express from 'express';
import {
  getRecordings,
  getRecordingById,
  uploadRecording,
  deleteRecording,
} from '../controllers/recordingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All recording routes require user authentication
router.use(protect);

router.get('/', getRecordings);
router.get('/:id', getRecordingById);

// Upload recording: Admin & Staff (multer processes request files)
router.post('/', authorize('admin', 'staff'), upload.single('recording'), uploadRecording);

// Delete recording: Admin, Consultant, and Staff
router.delete('/:id', authorize('admin', 'consultant', 'staff'), deleteRecording);

export default router;
