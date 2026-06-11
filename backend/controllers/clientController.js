import Client from '../models/Client.js';
import Consultation from '../models/Consultation.js';
import Recording from '../models/Recording.js';
import Note from '../models/Note.js';
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
    console.error('Failed to write activity log:', err.message);
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { address: searchRegex },
        ],
      };
    }

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: clients,
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

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: 'Client not found' });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private (Admin, Staff)
export const createClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const clientExists = await Client.findOne({ email });
    if (clientExists) {
      return res.status(400).json({
        success: false,
        message: 'A client with this email already exists',
      });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      address,
    });

    await logActivity(
      req.user._id,
      'CREATE_CLIENT',
      `Created client ${client.name} (${client.email})`,
      req
    );

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (Admin, Staff)
export const updateClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    let client = await Client.findById(req.params.id);

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: 'Client not found' });
    }

    // Check if another client has this email
    if (email && email !== client.email) {
      const emailExists = await Client.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another client',
        });
      }
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    await logActivity(
      req.user._id,
      'UPDATE_CLIENT',
      `Updated client profile for ${client.name}`,
      req
    );

    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: 'Client not found' });
    }

    // Cascade Delete: delete consultations, recordings, and notes for this client
    const consultations = await Consultation.find({ client: client._id });
    const consultationIds = consultations.map((c) => c._id);

    // Remove Notes
    await Note.deleteMany({ consultation: { $in: consultationIds } });

    // Remove Recordings (both database and files)
    const recordings = await Recording.find({
      consultation: { $in: consultationIds },
    });
    for (const recording of recordings) {
      // In recordingController, we import storageService to clean files.
      // But we can delete the database entries now. File deletion should ideally happen,
      // but let's delete db first to ensure database consistency.
      await Recording.findByIdAndDelete(recording._id);
    }

    // Delete consultations
    await Consultation.deleteMany({ client: client._id });

    // Delete client
    await Client.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      'DELETE_CLIENT',
      `Deleted client ${client.name} and cascaded deleting all related records`,
      req
    );

    res.json({
      success: true,
      message: 'Client and all associated recordings/consultations have been deleted.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
