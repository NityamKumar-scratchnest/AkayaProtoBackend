
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  address: String
}, { _id: false });

const DeviceSchema = new mongoose.Schema({
  payload: { type: String, 
     unique: true,
     required: true,
      index: true
     }, // device-0001
  //Box-alpha and all.
  name: { type: String, required: true },
  status: { type: String, default: 'Active' },
  isLocked: { type: Boolean, default: false },
  secretKey :{
    type : String,
    
  },
  temperature: Number,
  humidity: Number,
  batteryLevel: Number,
  firmwareVersion: String,
  model: String,
  location: LocationSchema,
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

DeviceSchema.index({ name: 'text', payload: 'text' });

export default mongoose.model('Device', DeviceSchema);
