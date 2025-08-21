import jwt from "jsonwebtoken";
import UserActivityLog from "../models/userActivityLogs.model.js";
import { JWT_SECRET } from "../config/config.js";

export async function logUserActivity(req, res, next) {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      // Extract token from headers
      const authHeader =
        req.headers["authorization"] || req.headers["Authorization"];
      let userId = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id || decoded._id || null;
        } catch (err) {
          console.log("❌ Invalid JWT token");
        }
      }

      // Debugging logs
      console.log("📡 Logging user activity:");
      console.log("   UserId:", userId || "Anonymous");
      console.log("   Method:", req.method);
      console.log("   Endpoint:", req.originalUrl);
      console.log("   Status:", res.statusCode);
      console.log("   IP:", req.ip);
      console.log("   User-Agent:", req.get("User-Agent"));

      await UserActivityLog.create({
        userId: userId || null, // Store null if no valid token
        method: req.method,
        endpoint: req.originalUrl,
        body: req.body,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } catch (error) {
      console.error("❌ Failed to log user activity:", error);
    } finally {
      const duration = Date.now() - start;
      console.log(`⏱ Request logging took ${duration}ms`);
    }
  });

  next();
}
