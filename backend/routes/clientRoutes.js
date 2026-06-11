import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All client routes require authentication
router.use(protect);

router.get('/', getClients);
router.get('/:id', getClientById);

// Creation & Editing limited to Admin and Staff
router.post('/', authorize('admin', 'staff'), createClient);
router.put('/:id', authorize('admin', 'staff'), updateClient);

// Deletions limited to Admin only (due to cascade effects)
router.delete('/:id', authorize('admin'), deleteClient);

export default router;
