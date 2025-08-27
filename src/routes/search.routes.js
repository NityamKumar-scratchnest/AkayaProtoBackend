// routes/search.routes.js
import express from "express";
import { searchDevices } from "../controllers/search.controller.js";

const router = express.Router();

// GET /api/search?q=Sensor&minTemp=30
router.get("/get", searchDevices);

export default router;
