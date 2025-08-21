import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Device from '../models/device.model.js';
import SensorLog from '../models/sensor-log.model.js';
import { generateMockDevices, generateMockSensorLogs } from '../utils/mock-data.js';
import { MONGO_URI } from '../config/config.js';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const devices = generateMockDevices(50);
  const sensorLogs = generateMockSensorLogs(devices, 7);

  console.log('Clearing old collections...');
  await Device.deleteMany({});
  await SensorLog.deleteMany({});

  console.log('Inserting devices...');
  await Device.insertMany(devices.map(d => ({
  payload: d.id,
  name: d.name,
  status: d.status,
  isLocked: d.isLocked,
  secretKey: d.secretKey, // ✅ include secretKey
  temperature: d.temperature,
  humidity: d.humidity,
  batteryLevel: d.batteryLevel,
  firmwareVersion: d.firmwareVersion,
  model: d.model,
  location: d.location,
  lastUpdate: d.lastUpdate,
  createdAt: new Date()
})));

  console.log('Inserting sensor logs in batches...');
  const batch = 200;
  for (let i=0;i<sensorLogs.length;i+=batch){
    await SensorLog.insertMany(sensorLogs.slice(i,i+batch).map(l=>({
      devicePayload: l.deviceId,
      timestamp: l.timestamp,
      temperature: l.temperature,
      humidity: l.humidity
    })));
    console.log(`Inserted ${Math.min(i+batch, sensorLogs.length)}/${sensorLogs.length}`);
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
