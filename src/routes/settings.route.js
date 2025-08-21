import express from 'express';
import { getSettings, upsertSettings, deleteSettings } from '../controllers/setting.controller.js';
import { logUserActivity } from '../middleware/userActivityLog.middleware.js';
const router = express.Router();

router.get('/:payload', getSettings ,logUserActivity);
router.put('/:payload', upsertSettings , logUserActivity);
router.delete('/:payload', deleteSettings , logUserActivity);

export default router;
