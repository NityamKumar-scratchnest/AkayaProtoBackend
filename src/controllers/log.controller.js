import SensorLog from '../models/sensor-log.model.js';
// Removed mongoose import as it's not strictly needed for traditional pagination ObjectId conversion here.

/**
 * Fetches sensor logs for a specific device with pagination and date filtering.
 *
 * This function now uses 'page' and 'limit' for traditional pagination,
 * and also returns total records and total pages for client-side display.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export async function getLogsForDevice(req, res, next) {
  try {
    const { payload } = req.params;

    // Parse pagination parameters with default values
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; // Default limit to 20 items per page
    const skip = (page - 1) * limit; // Calculate how many documents to skip

    // Parse date filters with default values
    // 'from' defaults to the beginning of time if not provided
    const from = req.query.from ? new Date(req.query.from) : new Date(0);
    // 'to' defaults to the current date if not provided
    const to = req.query.to ? new Date(req.query.to) : new Date();

    // Base filter for the device payload and timestamp range
    const filter = {
      devicePayload: payload,
      timestamp: { $gte: from, $lte: to }
    };

    // Get the total number of documents matching the filter
    const totalRecords = await SensorLog.countDocuments(filter);

    // Fetch the logs for the current page
    const logs = await SensorLog.find(filter)
      .sort({ timestamp: -1, _id: -1 }) // Sort by timestamp (desc) and then _id (desc) for consistent ordering
      .skip(skip) // Skip documents for previous pages
      .limit(limit); // Limit to the number of items per page

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    // Send the paginated data and metadata in the response
    res.json({
      data: logs,
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalRecords
    });

  } catch (err) {
    // Pass any errors to the error handling middleware
    next(err);
  }
}

/**
 * Fetches aggregated chart data for a specific device based on hours.
 * This function remains unchanged as it's for chart data, not table pagination.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
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
