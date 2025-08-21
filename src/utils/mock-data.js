import { subMinutes } from 'date-fns';
import crypto from 'crypto';

export const generateMockDevices = (count = 100) => {
  const devices = [];
  const statusOptions = ['Active'];
  const modelOptions = ['Smart-Cold Pro', 'Smart-Hot Pro', 'Smart-Cold Lite'];
  const addresses = [
    "Pari Chowk, Greater Noida",
    "Darri, Noida",
    "Bhutani Alphathum, Sector 90, Noida",
    "Sector 62, Noida",
    "Gaur City, Greater Noida West",
    "Indirapuram, Ghaziabad",
  ];
  const baseLat = 28.5;
  const baseLng = 77.4;

  for (let i = 1; i <= count; i++) {
    const id = `device-${String(i).padStart(4, '0')}`;
    const name = `Boxes ${i}`;
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const isLocked = Math.random() > 0.5;
    const temperature = parseFloat((Math.random() * (30 - 15) + 15).toFixed(1));
    const humidity = Math.floor(Math.random() * (80 - 40) + 40);
    const batteryLevel = Math.floor(Math.random() * 100);
    const firmwareVersion = `2.1.${Math.floor(Math.random() * 10)}`;
    const model = modelOptions[Math.floor(Math.random() * modelOptions.length)];
    const lastUpdate = new Date(Date.now() - Math.random() * 86400000).toISOString();
    const lat = parseFloat((baseLat + (Math.random() - 0.5) * 0.2).toFixed(14));
    const lng = parseFloat((baseLng + (Math.random() - 0.5) * 0.2).toFixed(14));
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    const secretKey = crypto.randomBytes(16).toString('hex'); // ✅ unique secret key

    devices.push({
      id,
      name,
      status,
      isLocked,
      temperature,
      humidity,
      batteryLevel,
      firmwareVersion,
      model,
      location: { lat, lng, address },
      lastUpdate,
      secretKey,
    });
  }
  return devices;
};

export const generateMockSensorLogs = (devices, days = 7) => {
  const logs = [];
  let logId = 1;
  const intervals = days * 24 * 4; // 15-min intervals
  devices.forEach((device) => {
    const now = new Date();
    for (let i = 0; i < intervals; i++) {
      const timestamp = subMinutes(now, i * 15).toISOString();
      const temperature = parseFloat((20 + (Math.random() - 0.5) * 10).toFixed(1));
      const humidity = Math.floor(60 + (Math.random() - 0.5) * 20);
      logs.push({
        id: `log-${String(logId++).padStart(7, '0')}`,
        deviceId: device.id,
        timestamp,
        temperature,
        humidity,
      });
    }
  });
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
