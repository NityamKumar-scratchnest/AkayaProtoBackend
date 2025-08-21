import express from 'express';
import { listDevices, getDevice ,addNewDevice} from '../controllers/device.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, listDevices);
router.get('/:payload', authMiddleware, getDevice);
router.post('/add',authMiddleware, addNewDevice);

export default router;
