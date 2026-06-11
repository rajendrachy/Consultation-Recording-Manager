import Consultation from '../models/Consultation.js';
import Recording from '../models/Recording.js';
import Client from '../models/Client.js';
import User from '../models/User.js';

// @desc    Get dashboard metrics & trends
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const totalConsultations = await Consultation.countDocuments({});
    const totalRecordings = await Recording.countDocuments({});
    const totalClients = await Client.countDocuments({});

    // Storage calculation
    const storageGroup = await Recording.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } },
    ]);
    const storageUsage = storageGroup.length > 0 ? storageGroup[0].totalSize : 0;

    // Recent recordings uploaded
    const recentUploads = await Recording.find({})
      .populate({
        path: 'consultation',
        populate: [
          { path: 'client', select: 'name' },
          { path: 'consultant', select: 'name' },
        ],
      })
      .sort({ uploadDate: -1 })
      .limit(6);

    // Monthly uploads over the last 6 months
    const monthsShort = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyStats = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const recordingsCount = await Recording.countDocuments({
        uploadDate: { $gte: startOfMonth, $lte: endOfMonth },
      });
      const consultationsCount = await Consultation.countDocuments({
        consultationDate: { $gte: startOfMonth, $lte: endOfMonth },
      });

      monthlyStats.push({
        month: monthsShort[monthDate.getMonth()],
        recordings: recordingsCount,
        consultations: consultationsCount,
      });
    }

    res.json({
      success: true,
      stats: {
        totalConsultations,
        totalRecordings,
        totalClients,
        storageUsage,
        recentUploads,
        monthlyStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed report metrics (Consultants work, formats, statuses)
// @route   GET /api/analytics/reports
// @access  Private
export const getFullAnalytics = async (req, res) => {
  try {
    // Consultant Performance workload metrics
    const consultants = await User.find({
      role: { $in: ['consultant', 'admin'] },
    });
    const consultantPerformance = [];

    for (const consultant of consultants) {
      const consultationsCount = await Consultation.countDocuments({
        consultant: consultant._id,
      });
      const consultationsList = await Consultation.find({
        consultant: consultant._id,
      });
      const consultationIds = consultationsList.map((c) => c._id);
      const recordingsCount = await Recording.countDocuments({
        consultation: { $in: consultationIds },
      });

      if (consultationsCount > 0 || recordingsCount > 0) {
        consultantPerformance.push({
          name: consultant.name,
          consultations: consultationsCount,
          recordings: recordingsCount,
        });
      }
    }

    // Status distributions
    const scheduled = await Consultation.countDocuments({ status: 'scheduled' });
    const completed = await Consultation.countDocuments({ status: 'completed' });
    const cancelled = await Consultation.countDocuments({ status: 'cancelled' });

    const statusData = [
      { name: 'Scheduled', value: scheduled, color: '#3b82f6' },
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' },
    ];

    // File extensions distributions
    const formatsData = await Recording.aggregate([
      { $group: { _id: '$fileType', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: {
        consultantPerformance,
        statusData,
        formatsData: formatsData.length > 0 ? formatsData : [{ name: 'None', value: 0 }],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
