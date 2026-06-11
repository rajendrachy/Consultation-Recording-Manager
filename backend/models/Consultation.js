import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Please associate a client'],
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a consultant'],
    },
    consultationDate: {
      type: Date,
      required: [true, 'Please specify the date and time of the consultation'],
    },
    duration: {
      type: Number, // duration in minutes
      required: [true, 'Please specify the consultation duration in minutes'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexing for analytics and query optimizations
consultationSchema.index({ client: 1 });
consultationSchema.index({ consultant: 1 });
consultationSchema.index({ consultationDate: -1 });

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
