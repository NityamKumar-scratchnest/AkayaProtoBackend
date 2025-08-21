import mongoose from 'mongoose';

const SensorLogSchema = new mongoose.Schema({
  devicePayload: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  temperature: Number,
  humidity: Number,
  createdAt: { type: Date, default: Date.now }
});

SensorLogSchema.index({ devicePayload: 1, timestamp: -1 });

export default mongoose.model('SensorLog', SensorLogSchema);
