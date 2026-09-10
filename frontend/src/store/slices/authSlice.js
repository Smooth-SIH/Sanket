import { createSlice } from '@reduxjs/toolkit';

export const getInitialViewFromUrl = () => {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  
  if (!path || path === 'landing') {
    return 'landing';
  }
  if (path.startsWith('app/')) {
    const sub = path.split('/')[1];
    return ['dashboard', 'map', 'alerts', 'assets', 'analytics'].includes(sub) ? sub : 'dashboard';
  }
  if (['dashboard', 'map', 'alerts', 'assets', 'analytics'].includes(path)) {
    return path;
  }
  if (path === 'app') {
    return localStorage.getItem('sanket_app_tab') || 'dashboard';
  }
  return 'landing';
};

const initialState = {
  user: {
    id: 'usr-1',
    name: 'Command Center Officer',
    email: 'officer@sanket.gov.in',
    role: 'DISASTER_OFFICER',
    organization: 'MOSDAC Severe Weather Wing'
  },
  token: localStorage.getItem('sanket_token') || 'demo_token',
  isAuthenticated: true,
  currentView: getInitialViewFromUrl() // Persisted based on active URL
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
      const view = action.payload;
      state.currentView = view;
      if (typeof window !== 'undefined') {
        if (view === 'landing') {
          if (window.location.pathname !== '/') {
            window.history.pushState(null, '', '/');
          }
        } else {
          localStorage.setItem('sanket_app_tab', view);
          const targetPath = `/app/${view}`;
          if (window.location.pathname !== targetPath) {
            window.history.pushState(null, '', targetPath);
          }
        }
      }
    }
  }
});

export const { setAuth, logout, setCurrentView } = authSlice.actions;
export default authSlice.reducer;
