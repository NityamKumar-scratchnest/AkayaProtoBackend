import DeviceSettings from '../models/device-settings.model.js';

// Get settings by devicePayload
export async function getSettings(req, res, next) {
  try {
    const { payload } = req.params;
    const settings = await DeviceSettings.findOne({ devicePayload: payload });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

// Create or update settings for a device
export async function upsertSettings(req, res, next) {
  try {
    const { payload } = req.params;
    const update = req.body;

    const settings = await DeviceSettings.findOneAndUpdate(
      { devicePayload: payload },
      { ...update, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (err) {
    next(err);
  }
}

// Delete settings by devicePayload (optional)
export async function deleteSettings(req, res, next) {
  try {
    const { payload } = req.params;
    const result = await DeviceSettings.deleteOne({ devicePayload: payload });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json({ message: 'Settings deleted' });
  } catch (err) {
    next(err);
  }
}
