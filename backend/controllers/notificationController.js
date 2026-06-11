import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    // Fetch notifications addressed to this user or broadcast to all (recipient is null)
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }],
    })
      .sort({ createdAt: -1 })
      .limit(40);

    // Map to include a custom read flag
    const data = notifications.map((notif) => {
      const isRead = notif.readBy.includes(req.user._id);
      return {
        ...notif._doc,
        isRead,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: 'Marked notification as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const unread = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }],
      readBy: { $ne: req.user._id },
    });

    for (const notif of unread) {
      notif.readBy.push(req.user._id);
      await notif.save();
    }

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
