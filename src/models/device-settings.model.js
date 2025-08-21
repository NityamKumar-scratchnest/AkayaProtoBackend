import mongoose from 'mongoose';

const DeviceSettingsSchema = new mongoose.Schema({
  devicePayload: { type: String, required: true, index: true, unique: true },
  tempMax: { type: Number, default: 30 },
  tempMin: { type: Number, default: 2 },
  humidityMax: { type: Number, default: 80 },
  humidityMin: { type: Number, default: 20 },
  firmwareAutoUpdate: { type: Boolean, default: false },
  connectivityTestsEnabled: { type: Boolean, default: true },
  alertNotificationsEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DeviceSettings', DeviceSettingsSchema);
