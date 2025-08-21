import mongoose from 'mongoose';

const ActionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', default: null },
  actionType: { type: String, required: true },
  entity: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

ActionLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActionLog', ActionLogSchema);
