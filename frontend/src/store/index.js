import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import satelliteReducer from './slices/satelliteSlice';
import alertReducer from './slices/alertSlice';
import assetReducer from './slices/assetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    satellite: satelliteReducer,
    alerts: alertReducer,
    assets: assetReducer,
  },
});
