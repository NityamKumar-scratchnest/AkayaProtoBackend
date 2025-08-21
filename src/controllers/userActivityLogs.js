import UserActivityLog from "../models/userActivityLogs.model.js";

// Get all logs (later you can add filters like by userId, endpoint, etc.)
export async function getUserActivityLogs(req, res) {
  try {
    const logs = await UserActivityLog.find()
      .populate("userId", "email _id") // fetch user details if available
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error("❌ Error fetching user activity logs:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
