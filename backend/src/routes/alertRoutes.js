import express from 'express';
import { getAlerts, acknowledgeAlert, createManualAlert } from '../controllers/alertController.js';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', createManualAlert);
router.post('/:id/acknowledge', acknowledgeAlert);

export default router;
