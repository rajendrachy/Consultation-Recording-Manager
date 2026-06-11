import Consultation from '../models/Consultation.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import Recording from '../models/Recording.js';
import Note from '../models/Note.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

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
    console.error('Activity logging failed:', err.message);
  }
};

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Private
export const getConsultations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Role restrictions: Consultants can only view their own consultations
    if (req.user.role === 'consultant') {
      query.consultant = req.user._id;
    } else if (req.query.consultant) {
      query.consultant = req.query.consultant;
    }

    // Client Filter
    if (req.query.client) {
      query.client = req.query.client;
    }

    // Status Filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Tag Filter
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Smart Search across Client Name or Consultant Name or Tags
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');

      // Find matching clients
      const clients = await Client.find({ name: searchRegex });
      const clientIds = clients.map((c) => c._id);

      // Find matching consultants (if logged in user is admin/staff)
      const consultants = await User.find({ name: searchRegex });
      const consultantIds = consultants.map((u) => u._id);

      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { client: { $in: clientIds } },
            { consultant: { $in: consultantIds } },
            { tags: searchRegex },
          ],
        },
      ];
    }

    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('client', 'name email phone')
      .populate('consultant', 'name email role')
      .sort({ consultationDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: consultations,
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

// @desc    Get single consultation details
// @route   GET /api/consultations/:id
// @access  Private
export const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('consultant', 'name email role');

    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, message: 'Consultation not found' });
    }

    // Role check: Consultant can only view their own consultations
    if (
      req.user.role === 'consultant' &&
      consultation.consultant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this consultation',
      });
    }

    // Find notes linked to this consultation
    const notes = await Note.find({ consultation: consultation._id })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    // Find recordings linked to this consultation
    const recordings = await Recording.find({ consultation: consultation._id });

    res.json({
      success: true,
      data: {
        ...consultation._doc,
        notes,
        recordings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new consultation
// @route   POST /api/consultations
// @access  Private (Admin, Staff)
export const createConsultation = async (req, res) => {
  try {
    const { client, consultant, consultationDate, duration, status, tags } =
      req.body;

    // Verify client & consultant exist
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res
        .status(404)
        .json({ success: false, message: 'Associated Client not found' });
    }

    const consultantUser = await User.findById(consultant);
    if (!consultantUser || consultantUser.role === 'staff') {
      return res.status(400).json({
        success: false,
        message: 'Assigned user must exist and have Admin or Consultant role',
      });
    }

    const consultation = await Consultation.create({
      client,
      consultant,
      consultationDate,
      duration,
      status: status || 'scheduled',
      tags: tags || [],
    });

    // Notify Consultant
    await Notification.create({
      recipient: consultant,
      type: 'info',
      title: 'New Consultation Assigned',
      message: `You have been assigned to a new consultation with client ${clientExists.name} on ${new Date(
        consultationDate
      ).toLocaleDateString()}`,
    });

    await logActivity(
      req.user._id,
      'CREATE_CONSULTATION',
      `Scheduled consultation for client ${clientExists.name} with consultant ${consultantUser.name}`,
      req
    );

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update consultation details
// @route   PUT /api/consultations/:id
// @access  Private (Admin, Staff, Consultant)
export const updateConsultation = async (req, res) => {
  try {
    const { consultationDate, duration, status, tags, consultant } = req.body;

    let consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, message: 'Consultation not found' });
    }

    // Role check: Consultant can only update their own consultations
    if (
      req.user.role === 'consultant' &&
      consultation.consultant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this consultation',
      });
    }

    // Check if consultant reassignment is allowed (Admin/Staff only)
    let assignedConsultant = consultation.consultant;
    if (consultant && consultant !== consultation.consultant.toString()) {
      if (req.user.role === 'consultant') {
        return res.status(403).json({
          success: false,
          message: 'Consultants cannot reassign consultations',
        });
      }
      const newConsultant = await User.findById(consultant);
      if (!newConsultant) {
        return res
          .status(404)
          .json({ success: false, message: 'Assigned consultant not found' });
      }
      assignedConsultant = consultant;

      // Notify the new consultant
      const clientObj = await Client.findById(consultation.client);
      await Notification.create({
        recipient: newConsultant._id,
        type: 'info',
        title: 'Consultation Reassigned',
        message: `You have been reassigned to consultation with client ${
          clientObj?.name || 'Client'
        }`,
      });
    }

    consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      {
        consultationDate: consultationDate || consultation.consultationDate,
        duration: duration || consultation.duration,
        status: status || consultation.status,
        tags: tags || consultation.tags,
        consultant: assignedConsultant,
      },
      { new: true, runValidators: true }
    );

    await logActivity(
      req.user._id,
      'UPDATE_CONSULTATION',
      `Updated details of consultation ID: ${consultation._id}`,
      req
    );

    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete consultation
// @route   DELETE /api/consultations/:id
// @access  Private (Admin)
export const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, message: 'Consultation not found' });
    }

    // Cascading Delete Notes & Recordings
    await Note.deleteMany({ consultation: consultation._id });

    // In a real-world app, we should delete files from Cloudinary here.
    const recordings = await Recording.find({ consultation: consultation._id });
    for (const rec of recordings) {
      await Recording.findByIdAndDelete(rec._id);
    }

    await Consultation.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      'DELETE_CONSULTATION',
      `Deleted consultation ID: ${consultation._id} and all related records`,
      req
    );

    res.json({
      success: true,
      message: 'Consultation and related notes/recordings deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
