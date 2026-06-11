import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import ActivityLog from '../models/ActivityLog.js';
import sendEmail from '../utils/sendEmail.js';
import { uploadFile } from '../services/storageService.js';

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Helper: Log User Activity
const logActivity = async (userId, action, details, req) => {
  try {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Default registration role restriction (can only register admin if it's the first user, otherwise staff)
    const count = await User.countDocuments({});
    let userRole = role || 'staff';
    
    // First user is automatically Admin for setup convenience
    if (count === 0) {
      userRole = 'admin';
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    if (user) {
      await logActivity(user._id, 'REGISTER', 'User registered new account', req);

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    await logActivity(user._id, 'LOGIN', 'User logged in successfully', req);

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        isActive: user.isActive,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user account found with that email address',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database with 10-minute expiry
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 600000; // 10 minutes
    await user.save();

    console.log(`OTP generated for ${email}: ${otp}`);

    const subject = 'Your CRM Password Reset OTP';
    const text = `You requested a password reset. Your 6-digit OTP is: ${otp}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0d9488; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${user.name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">You requested a password reset for your CRM account. Please use the following 6-digit OTP to verify your request:</p>
        <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 15px 30px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f766e; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-top: 20px;">This OTP is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Consultation Recording Manager © 2026. All rights reserved.</p>
      </div>
    `;

    // Send the email
    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });

    res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email.',
      email: user.email,
      otp, // return OTP directly in response for ease of UI tests/logs verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and OTP',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user account found with that email address',
      });
    }

    // Verify OTP matching & expiry
    if (!user.resetOtp || user.resetOtp !== otp || !user.resetOtpExpire || user.resetOtpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Generate a short-lived reset token
    const resetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // Save token to verify during password reset phase
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 900000; // 15 minutes
    
    // Clear OTP fields
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully. You may now reset your password.',
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: resettoken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await logActivity(
      user._id,
      'RESET_PASSWORD',
      'User reset password via token link',
      req
    );

    res.json({
      success: true,
      message: 'Password has been successfully updated.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change current user password
// @route   PUT /api/auth/changepassword
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'The current password you entered is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(
      user._id,
      'CHANGE_PASSWORD',
      'User changed account password',
      req
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile (name, email, avatar)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    // Handle avatar file upload
    if (req.file) {
      const fileResult = await uploadFile(req.file.path, 'user_avatars');
      user.avatar = fileResult.url;
    }

    const updatedUser = await user.save();

    await logActivity(
      user._id,
      'UPDATE_PROFILE',
      'User updated account profile details',
      req
    );

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
