import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hazardType: { 
    type: String, 
    enum: ['Cloudburst', 'Flash Flood', 'Severe Thunderstorm', 'Hailstorm'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['CRITICAL', 'WARNING', 'WATCH', 'ADVISORY'], 
    default: 'WARNING' 
  },
  riskScore: { type: Number, required: true },
  leadTimeMins: { type: Number, default: 30 },
  affectedRegion: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point', 'Polygon'], default: 'Point' },
    coordinates: { type: Schema.Types.Mixed, required: true } // [lon, lat] or [[lon, lat], ...]
  },
  parameters: {
    IWV_mm: Number,
    CTT_K: Number,
    CAPE_Jkg: Number,
    rain_rate_mmh: Number
  },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: String, default: null },
  acknowledgedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Geospatial Index
alertSchema.index({ location: '2dsphere' });

export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
