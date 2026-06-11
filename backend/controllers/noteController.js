import Note from '../models/Note.js';
import Consultation from '../models/Consultation.js';

// @desc    Get notes for a consultation
// @route   GET /api/notes/consultation/:consultationId
// @access  Private
export const getNotesByConsultation = async (req, res) => {
  try {
    const notes = await Note.find({ consultation: req.params.consultationId })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create note for a consultation
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { consultationId, content } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, message: 'Associated consultation not found' });
    }

    // Role check: Consultant can only add notes to their own consultation
    if (
      req.user.role === 'consultant' &&
      consultation.consultant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to write notes for this consultation',
      });
    }

    const note = await Note.create({
      consultation: consultationId,
      author: req.user._id,
      content,
    });

    const populatedNote = await Note.findById(note._id).populate(
      'author',
      'name email role'
    );

    res.status(201).json({ success: true, data: populatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const { content } = req.body;

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Authorization: Only the note's author or an admin can edit
    if (
      note.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this note',
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true, runValidators: true }
    ).populate('author', 'name email role');

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Authorization: Only the note's author or an admin can delete
    if (
      note.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this note',
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
