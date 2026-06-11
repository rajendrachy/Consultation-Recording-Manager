import Recording from '../models/Recording.js';
import Consultation from '../models/Consultation.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { uploadFile, deleteFile } from '../services/storageService.js';
import { generateAIInsights } from '../services/aiService.js';
import path from 'path';

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

// @desc    Get all recordings (with search & filters)
// @route   GET /api/recordings
// @access  Private
export const getRecordings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by Consultant
    if (req.user.role === 'consultant') {
      // Find consultation IDs belonging to this consultant
      const consultations = await Consultation.find({ consultant: req.user._id });
      const consultationIds = consultations.map((c) => c._id);
      query.consultation = { $in: consultationIds };
    } else if (req.query.consultant) {
      const consultations = await Consultation.find({ consultant: req.query.consultant });
      const consultationIds = consultations.map((c) => c._id);
      query.consultation = { $in: consultationIds };
    }

    // Filter by Date
    if (req.query.startDate && req.query.endDate) {
      query.uploadDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Smart Search (inside title or transcript content)
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const total = await Recording.countDocuments(query);
    const recordings = await Recording.find(query)
      .populate({
        path: 'consultation',
        populate: [
          { path: 'client', select: 'name email' },
          { path: 'consultant', select: 'name email' },
        ],
      })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: recordings,
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

// @desc    Get single recording
// @route   GET /api/recordings/:id
// @access  Private
export const getRecordingById = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id).populate({
      path: 'consultation',
      populate: [
        { path: 'client', select: 'name email phone' },
        { path: 'consultant', select: 'name email role' },
      ],
    });

    if (!recording) {
      return res
        .status(404)
        .json({ success: false, message: 'Recording not found' });
    }

    // Role check: Consultant can only view their own consultations' recordings
    if (
      req.user.role === 'consultant' &&
      recording.consultation.consultant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this recording',
      });
    }

    res.json({ success: true, data: recording });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload & process recording (with AI analysis)
// @route   POST /api/recordings
// @access  Private (Admin, Staff)
export const uploadRecording = async (req, res) => {
  try {
    const { title, consultationId } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Please upload an audio/video file' });
    }

    // Find consultation
    const consultation = await Consultation.findById(consultationId)
      .populate('client', 'name')
      .populate('consultant', 'name');

    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, message: 'Linked Consultation not found' });
    }

    // Check if recording already exists for this consultation (1-to-1)
    const existingRecording = await Recording.findOne({ consultation: consultationId });
    if (existingRecording) {
      return res.status(400).json({
        success: false,
        message: 'A recording already exists for this consultation. Please delete it first.',
      });
    }

    // Process file upload (Cloudinary / Local fallback)
    const fileResult = await uploadFile(req.file.path);

    // Approximate audio duration if not provided (e.g. 15 seconds per MB)
    const sizeInMB = req.file.size / (1024 * 1024);
    const calculatedDuration = Math.max(30, Math.round(sizeInMB * 15));

    // Call AI intelligence service to generate transcript/summary
    const aiResult = await generateAIInsights(
      title,
      consultation.client.name,
      consultation.consultant.name,
      consultation.tags
    );

    const recording = await Recording.create({
      title,
      consultation: consultationId,
      recordingUrl: fileResult.url,
      cloudinaryPublicId: fileResult.publicId,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      duration: calculatedDuration,
      transcript: aiResult.transcript,
      summary: aiResult.summary,
      discussionPoints: aiResult.discussionPoints,
      actionItems: aiResult.actionItems,
    });

    // Notify consultant of upload success & processing
    await Notification.create({
      recipient: consultation.consultant._id,
      type: 'success',
      title: 'Recording Uploaded & Analyzed',
      message: `A recording was added to your consultation with ${consultation.client.name}. AI transcripts and summary cards are ready.`,
    });

    await logActivity(
      req.user._id,
      'UPLOAD_RECORDING',
      `Uploaded recording "${title}" for consultation ID ${consultation._id}`,
      req
    );

    res.status(201).json({ success: true, data: recording });
  } catch (error) {
    // Delete temp file if anything fails
    if (req.file && req.file.path) {
      try {
        import('fs').then((fs) => {
          if (fs.default.existsSync(req.file.path)) {
            fs.default.unlinkSync(req.file.path);
          }
        });
      } catch (err) {
        console.error('Cleanup temp failed:', err.message);
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete recording
// @route   DELETE /api/recordings/:id
// @access  Private (Admin)
export const deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);

    if (!recording) {
      return res
        .status(404)
        .json({ success: false, message: 'Recording not found' });
    }

    // Delete resource file from Cloudinary/Local
    await deleteFile(recording.cloudinaryPublicId, recording.recordingUrl);

    // Delete database entry
    await Recording.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      'DELETE_RECORDING',
      `Deleted recording "${recording.title}"`,
      req
    );

    res.json({
      success: true,
      message: 'Recording file and transcription deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
