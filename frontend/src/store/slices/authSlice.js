import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {
    id: 'usr-1',
    name: 'Command Center Officer',
    email: 'officer@sanket.gov.in',
    role: 'DISASTER_OFFICER',
    organization: 'NDRF / MOSDAC Severe Weather Wing'
  },
  token: localStorage.getItem('sanket_token') || 'demo_token_sih2026',
  isAuthenticated: true,
  currentView: 'landing' // 'landing' | 'dashboard' | 'map' | 'alerts' | 'assets' | 'analytics' | 'settings'
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('sanket_token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('sanket_token');
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    }
  }
});

export const { setAuth, logout, setCurrentView } = authSlice.actions;
export default authSlice.reducer;
