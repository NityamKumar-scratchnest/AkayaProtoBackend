import express from 'express';
import { getLogsForDevice, chartForDevice } from '../controllers/log.controller.js';

const router = express.Router();

router.get('/:payload', getLogsForDevice);
router.get('/:payload/chart', chartForDevice);

export default router;
