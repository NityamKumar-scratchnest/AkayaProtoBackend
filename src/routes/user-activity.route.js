import express from "express";
import {getUserActivityLogs} from "../controllers/userActivityLogs.js"

const router = express.Router();

// GET all user activity logs
router.get("/", getUserActivityLogs);

export default router;
