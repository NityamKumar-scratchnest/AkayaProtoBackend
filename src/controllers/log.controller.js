import SensorLog from '../models/sensor-log.model.js';
import mongoose from 'mongoose';

export async function getLogsForDevice(req, res, next) {
  try {
    const { payload } = req.params;
    const limit = Math.min(Number(req.query.limit || 500), 5000);
    const from = req.query.from ? new Date(req.query.from) : new Date(0);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const cursor = req.query.cursor;

    const filter = { devicePayload: payload, timestamp: { $gte: from, $lte: to } };

    if (cursor) {
      const [tsStr, id] = cursor.split('::');
      const ts = new Date(tsStr);
      filter.$and = [
        { $or: [{ timestamp: { $lt: ts } }, { $and: [{ timestamp: ts }, { _id: { $lt: mongoose.Types.ObjectId(id) } }] }] }
      ];
    }

    const logs = await SensorLog.find(filter).sort({ timestamp: -1, _id: -1 }).limit(limit + 1);
    let nextCursor = null;
    if (logs.length > limit) {
      const last = logs[limit - 1];
      nextCursor = `${last.timestamp.toISOString()}::${last._id}`;
      logs.splice(limit);
    }

    res.json({ data: logs, nextCursor });
  } catch (err) {
    next(err);
  }
}

export async function chartForDevice(req, res, next) {
  try {
    const { payload } = req.params;
    const hours = Number(req.query.hours || 24);
    const from = new Date(Date.now() - hours * 3600000);

    const pipeline = [
      { $match: { devicePayload: payload, timestamp: { $gte: from } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hour: { $hour: '$timestamp' }
          },
          avgTemp: { $avg: '$temperature' },
          avgHum: { $avg: '$humidity' },
          ts: { $min: '$timestamp' }
        }
      },
      { $sort: { ts: 1 } },
      {
        $project: {
          timestamp: '$ts',
          temperature: { $round: ['$avgTemp', 1] },
          humidity: { $round: ['$avgHum', 0] }
        }
      }
    ];

    const result = await SensorLog.aggregate(pipeline).exec();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
