import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['HYDRO_DAM', 'POWER_GRID', 'TELECOM_TOWER', 'BRIDGE', 'HOSPITAL', 'RELIEF_CAMP'], 
    required: true 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  region: { type: String, required: true },
  elevationMeters: { type: Number, default: 1200 },
  criticalityScore: { type: Number, min: 1, max: 10, default: 8 },
  currentRiskStatus: { 
    type: String, 
    enum: ['SAFE', 'MODERATE', 'HIGH_DANGER', 'EVACUATION_REQUIRED'], 
    default: 'SAFE' 
  },
  lastAssessedAt: { type: Date, default: Date.now }
});

assetSchema.index({ location: '2dsphere' });

export const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
