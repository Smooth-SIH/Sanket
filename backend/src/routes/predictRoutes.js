import express from 'express';
import { getPrediction, getShapAttribution } from '../controllers/predictController.js';

const router = express.Router();

router.post('/nowcast', getPrediction);
router.post('/shap', getShapAttribution);

export default router;
