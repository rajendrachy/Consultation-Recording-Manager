import express from 'express';
import {
  getConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from '../controllers/consultationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All consultation routes require JWT verification
router.use(protect);

router.get('/', getConsultations);
router.get('/:id', getConsultationById);

// Post new consultation: Admin & Staff
router.post('/', authorize('admin', 'staff'), createConsultation);

// Update details: Admin, Staff & assigned Consultant
router.put('/:id', authorize('admin', 'staff', 'consultant'), updateConsultation);

// Delete: Admin only
router.delete('/:id', authorize('admin'), deleteConsultation);

export default router;
