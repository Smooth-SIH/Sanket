import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  assets: [],
  selectedCategory: 'ALL',
  selectedAsset: null
};

export const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets: (state, action) => {
      state.assets = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedAsset: (state, action) => {
      state.selectedAsset = action.payload;
    }
  }
});

export const { setAssets, setSelectedCategory, setSelectedAsset } = assetSlice.actions;
export default assetSlice.reducer;
