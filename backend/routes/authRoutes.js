import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/changepassword', protect, changePassword);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
