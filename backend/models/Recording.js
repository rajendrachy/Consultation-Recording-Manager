import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a recording title'],
      trim: true,
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: [true, 'Please link to a consultation'],
      unique: true, // Let's make it one recording per consultation for clean UI, or leave it non-unique? Let's leave it non-unique but default to 1-to-1 in normal flows.
    },
    recordingUrl: {
      type: String,
      required: [true, 'Recording file URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    // AI Features
    transcript: {
      type: String,
    },
    summary: {
      type: String,
    },
    discussionPoints: [
      {
        type: String,
      },
    ],
    actionItems: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Enable full-text search index for smart transcript search
recordingSchema.index({ title: 'text', transcript: 'text' });

const Recording = mongoose.model('Recording', recordingSchema);
export default Recording;
