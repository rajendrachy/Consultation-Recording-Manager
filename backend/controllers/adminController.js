import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all users for user admin panel
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user's role or status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    // Prevent administrators from deactivating or demoting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Security warning: You cannot modify your own administrative role or status.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User account not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User account credentials updated successfully.',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    // Prevent administrators from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Security warning: You cannot delete your own administrative account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User account not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `User account for "${user.name}" has been deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system activity logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
export const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await ActivityLog.countDocuments({});
    const logs = await ActivityLog.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// System Settings Store (In-memory mock variable that resets on app boot)
let systemSettings = {
  organizationName: 'HealthCare Partners Ltd.',
  allowedUploadFormats: ['mp3', 'wav', 'm4a', 'mp4', 'webm'],
  enableAIAutoTranscription: true,
  maxUploadSizeMB: 50,
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSystemSettings = async (req, res) => {
  try {
    res.json({ success: true, settings: systemSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSystemSettings = async (req, res) => {
  try {
    systemSettings = {
      ...systemSettings,
      ...req.body,
    };
    res.json({
      success: true,
      message: 'System settings saved successfully.',
      settings: systemSettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
