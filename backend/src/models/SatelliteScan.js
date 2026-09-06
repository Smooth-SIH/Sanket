import mongoose from 'mongoose';

const satelliteScanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  satellite: { type: String, default: 'INSAT-3DR' },
  timestamp: { type: Date, default: Date.now },
  metrics: {
    IWV_mm: Number,
    CTT_K: Number,
    CAPE_Jkg: Number,
    CIN_Jkg: Number,
    rain_rate_mmh: Number,
    wind_speed_kmh: Number,
    humidity_pct: Number
  },
  nowcast: {
    primaryHazard: String,
    severity: String,
    overallRiskScore: Number,
    leadTimeMins: Number
  }
});

export const SatelliteScan = mongoose.models.SatelliteScan || mongoose.model('SatelliteScan', satelliteScanSchema);
