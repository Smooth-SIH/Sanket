import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['DISASTER_OFFICER', 'ANALYST', 'ADMIN'], default: 'DISASTER_OFFICER' },
  organization: { type: String, default: 'NDRF / MOSDAC Weather Wing' },
  preferences: {
    alertThresholdIWV: { type: Number, default: 50.0 },
    enableWebsockets: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
