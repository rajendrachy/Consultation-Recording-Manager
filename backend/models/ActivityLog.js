import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    // E.g. 'LOGIN', 'UPLOAD_RECORDING', 'CREATE_CLIENT', 'DELETE_RECORDING', 'UPDATE_CONSULTATION'
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
