// controllers/search.controller.js
import Device from "../models/device.model.js";

/**
 * Search devices by name or payload, or filter by temperature.
 *
 * @param {object} req - Express request object (expects req.query.q, req.query.minTemp).
 * @param {object} res - Express response object.
 */
export async function searchDevices(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    const minTemp = parseFloat(req.query.minTemp) || null;
    const limit = parseInt(req.query.limit, 10) || 20;
    console.log(req.query)

    const filter = {};

    // If search query provided → match payload or name
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ payload: regex }, { name: regex }];
    }

    // If temperature filter provided
    if (minTemp !== null) {
      filter.temperature = { $gt: minTemp };
    }

    // Query DB with filter
    const results = await Device.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("payload name temperature status"); // return only lightweight fields

    res.json(results);
  } catch (err) {
    next(err);
  }
}
