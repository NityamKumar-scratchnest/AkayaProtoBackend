import Device from '../models/device.model.js';
import DeviceSettings from '../models/device-settings.model.js';
// Removed mongoose import as it's not strictly necessary for this pagination logic,
// and the provided pagination utilities were for cursor-based.
// Removed unused imports from the original file if they are not used anywhere else
// in the provided code snippet.
// import mongoose from 'mongoose'; // Not directly used in new pagination logic
// import { createCursorFromDoc, parseCursor } from '../utils/pagination.js'; // Not used with page-based pagination

/**
 * Lists devices with traditional page-based pagination, search, and returns
 * total records and total pages.
 *
 * @param {object} req - Express request object (expects req.query.page, req.query.limit, req.query.q).
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export async function listDevices(req, res, next) {
  try {
    // Parse pagination parameters with default values
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 20; // Default to 20 items per page
    const skip = (page - 1) * limit; // Calculate how many documents to skip

    const q = (req.query.q || "").trim(); // Get search query

    const filter = {}; // Initialize filter object

    // Apply search filter if 'q' is provided
    if (q) {
      // Create a case-insensitive regex for searching payload or name
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ payload: regex }, { name: regex }];
    }

    // Get the total number of documents matching the filter
    // This is crucial for calculating total pages and showing total records
    const totalRecords = await Device.countDocuments(filter);

    // Fetch devices for the current page
    const devices = await Device.find(filter)
      .sort({ createdAt: -1, _id: -1 }) // Sort by creation date (desc) and then _id (desc) for consistent ordering
      .skip(skip) // Skip documents for previous pages
      .limit(limit); // Limit to the number of items per page

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    // Send the paginated data and metadata in the response
    res.json({
      data: devices,        // The array of devices for the current page
      currentPage: page,    // The current page number
      totalPages: totalPages, // The total number of pages
      totalRecords: totalRecords // The total number of records across all pages
    });

  } catch (err) {
    // Pass any errors to the Express error handling middleware
    next(err);
  }
}

/**
 * Fetches a single device and its settings by payload.
 * This function remains unchanged.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
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

/**
 * Adds a new device to the database.
 * This function remains unchanged.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
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
