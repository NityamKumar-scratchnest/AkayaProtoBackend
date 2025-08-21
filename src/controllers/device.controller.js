import Device from '../models/device.model.js';
import DeviceSettings from '../models/device-settings.model.js';
import mongoose from 'mongoose';
import { createCursorFromDoc, parseCursor } from '../utils/pagination.js';

// function createCursorFromDoc(doc) {
//   return Buffer.from(
//     JSON.stringify({
//       createdAt: doc.createdAt.toISOString(),
//       id: doc._id.toString()
//     })
//   ).toString("base64");
// }

// function parseCursor(cursor) {
//   try {
//     const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
//     return {
//       createdAt: new Date(decoded.createdAt),
//       id: decoded.id
//     };
//   } catch (err) {
//     return { createdAt: new Date("invalid"), id: null };
//   }
// }

export async function listDevices(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 30), 100);
    const q = (req.query.q || "").trim();
    const cursor = req.query.cursor;
    const prevCursor = req.query.prevCursor;
    const filter = {};

    // Helpers
    function createCursorFromDoc(doc) {
      return Buffer.from(
        JSON.stringify({
          createdAt: doc.createdAt.toISOString(),
          id: doc._id.toString()
        })
      ).toString("base64");
    }

    function parseCursor(cursorStr) {
      const decoded = JSON.parse(
        Buffer.from(cursorStr, "base64").toString("utf8")
      );
      return {
        createdAt: new Date(decoded.createdAt),
        id: new mongoose.Types.ObjectId(decoded.id)
      };
    }

    // Search filter
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ payload: regex }, { name: regex }];
    }

    // Forward pagination
    if (cursor && !prevCursor) {
      const { createdAt, id } = parseCursor(cursor);
      if (isNaN(createdAt.getTime()) || !id) {
        return res.status(400).json({ message: "Invalid cursor" });
      }
      filter.$and = [
        {
          $or: [
            { createdAt: { $lt: createdAt } },
            { $and: [{ createdAt }, { _id: { $lt: id } }] }
          ]
        }
      ];
    }

    // Backward pagination
    if (prevCursor && !cursor) {
      const { createdAt, id } = parseCursor(prevCursor);
      if (isNaN(createdAt.getTime()) || !id) {
        return res.status(400).json({ message: "Invalid prevCursor" });
      }
      filter.$and = [
        {
          $or: [
            { createdAt: { $gt: createdAt } },
            { $and: [{ createdAt }, { _id: { $gt: id } }] }
          ]
        }
      ];
    }

    // Determine sort direction
    const sortOrder =
      prevCursor && !cursor ? { createdAt: 1, _id: 1 } : { createdAt: -1, _id: -1 };

    let docs = await Device.find(filter)
      .sort(sortOrder)
      .limit(limit + 1);

    // If going backward, reverse the results so they're in the right order
    if (prevCursor && !cursor) {
      docs = docs.reverse();
    }

    // Generate cursors
    let nextCursorOut = null;
    let prevCursorOut = null;

    if (docs.length > limit) {
      if (prevCursor && !cursor) {
        // When going backward, extra doc is at start
        prevCursorOut = createCursorFromDoc(docs[0]);
        docs.splice(0, 1);
      } else {
        // When going forward, extra doc is at end
        nextCursorOut = createCursorFromDoc(docs[limit]);
        docs.splice(limit);
      }
    }

    if (docs.length > 0) {
      prevCursorOut = prevCursorOut || createCursorFromDoc(docs[0]);
      nextCursorOut = nextCursorOut || createCursorFromDoc(docs[docs.length - 1]);
    }

    res.json({ data: docs, nextCursor: nextCursorOut, prevCursor: prevCursorOut });
  } catch (err) {
    next(err);
  }
}
export async function getDevice(req, res, next) {
  try {
    const { payload } = req.params;
    const device = await Device.findOne({ payload });
    if (!device) return res.status(404).json({ message: 'Not found' });

    const settings = await DeviceSettings.findOne({ devicePayload: payload });
    res.json({ device, settings });
  } catch (err) {
    next(err);
  }
}


export async function addNewDevice(req, res, next) {
  try {
    const { payload, name, model, secretKey } = req.body;
    console.log(payload)

    if (!payload || !name || !model || !secretKey) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if device with same payload exists
    const existingDevice = await Device.findOne({ payload });
    if (existingDevice) {
      return res.status(409).json({ message: 'Device with this ID already exists' });
    }

    const newDevice = new Device({
      payload,
      name,
      model,
      secretKey,
    });

    await newDevice.save();

    res.status(201).json({ message: 'Device added successfully', device: newDevice });
  } catch (error) {
    next(error);
  }
} 