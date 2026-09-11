import express from 'express';
import { getAlerts, acknowledgeAlert, createManualAlert } from '../controllers/alertController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', createManualAlert);
router.post('/:id/acknowledge', optionalAuth, acknowledgeAlert);

export default router;
