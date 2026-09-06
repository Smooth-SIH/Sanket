import express from 'express';
import { getLatestSatelliteScan, triggerSatelliteIngest, getSatelliteTimeline } from '../controllers/satelliteController.js';

const router = express.Router();

router.get('/latest', getLatestSatelliteScan);
router.post('/ingest', triggerSatelliteIngest);
router.get('/timeline', getSatelliteTimeline);

export default router;
