import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanket_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.io singleton manager
let socket = null;

export const initSocket = (onSatelliteUpdate, onCriticalAlert, onConnectStatus) => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : window.location.origin);
    socket = io(socketUrl, {
      reconnectionAttempts: 10,
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to telemetry stream');
      if (onConnectStatus) onConnectStatus(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
      if (onConnectStatus) onConnectStatus(false);
    });

    socket.on('satellite:update', (scanData) => {
      if (onSatelliteUpdate) onSatelliteUpdate(scanData);
    });

    socket.on('alert:critical', (alertData) => {
      if (onCriticalAlert) onCriticalAlert(alertData);
    });
  }
  return socket;
};

// API Functions
export const fetchLatestSatelliteScan = async () => {
  const res = await apiClient.get('/satellite/latest');
  return res.data;
};

export const fetchSatelliteTimeline = async () => {
  const res = await apiClient.get('/satellite/timeline');
  return res.data;
};

export const fetchAlerts = async (params = {}) => {
  const res = await apiClient.get('/alerts', { params });
  return res.data;
};

export const acknowledgeAlertApi = async (id, officerName) => {
  const res = await apiClient.post(`/alerts/${id}/acknowledge`, { officerName });
  return res.data;
};

export const fetchAssets = async (params = {}) => {
  const res = await apiClient.get('/assets', { params });
  return res.data;
};

export const fetchMapRiskZones = async () => {
  const res = await apiClient.get('/map/risk-zones');
  return res.data;
};

export const runNowcastPrediction = async (parameters) => {
  const res = await apiClient.post('/predict/nowcast', parameters);
  return res.data;
};

// Authentication & Personnel APIs
export const loginApi = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
};

export const registerApi = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data;
};

export const getMeApi = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

export const fetchRegisteredPersonnelApi = async () => {
  const res = await apiClient.get('/auth/registered-personnel');
  return res.data;
};

