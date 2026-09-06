import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  latestScan: null,
  isLiveConnected: false,
  lastScanTimestamp: null,
  selectedRegion: 'Garhwal Himalayas'
};

export const satelliteSlice = createSlice({
  name: 'satellite',
  initialState,
  reducers: {
    setLatestScan: (state, action) => {
      state.latestScan = action.payload;
      state.lastScanTimestamp = action.payload.timestamp;
    },
    setLiveConnected: (state, action) => {
      state.isLiveConnected = action.payload;
    },
    setSelectedRegion: (state, action) => {
      state.selectedRegion = action.payload;
    }
  }
});

export const { setLatestScan, setLiveConnected, setSelectedRegion } = satelliteSlice.actions;
export default satelliteSlice.reducer;
