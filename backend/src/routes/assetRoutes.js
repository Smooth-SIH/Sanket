import express from 'express';
import { getAssets, getAssetById, createAsset, assessAssetRisk } from '../controllers/assetController.js';

const router = express.Router();

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.get('/:id/assess', assessAssetRisk);

export default router;
