import express from 'express';
import {
  getNotesByConsultation,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Notes require JWT validation
router.use(protect);

router.get('/consultation/:consultationId', getNotesByConsultation);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
