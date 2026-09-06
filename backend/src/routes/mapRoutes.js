import express from 'express';
import { getMapRiskZones, getMapOverlays } from '../controllers/mapController.js';

const router = express.Router();

router.get('/risk-zones', getMapRiskZones);
router.get('/overlays', getMapOverlays);

export default router;
