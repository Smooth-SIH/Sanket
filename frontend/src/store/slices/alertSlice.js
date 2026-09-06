import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: [],
  selectedHazardFilter: 'ALL',
  selectedSeverityFilter: 'ALL',
  activeAlertCount: 0
};

export const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action) => {
      state.alerts = action.payload;
      state.activeAlertCount = action.payload.filter(a => !a.acknowledged).length;
    },
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
      if (!action.payload.acknowledged) {
        state.activeAlertCount += 1;
      }
    },
    acknowledgeAlertInState: (state, action) => {
      const alert = state.alerts.find(a => a.id === action.payload.id);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        alert.acknowledgedBy = action.payload.officerName;
        alert.acknowledgedAt = new Date().toISOString();
        state.activeAlertCount = Math.max(0, state.activeAlertCount - 1);
      }
    },
    setHazardFilter: (state, action) => {
      state.selectedHazardFilter = action.payload;
    },
    setSeverityFilter: (state, action) => {
      state.selectedSeverityFilter = action.payload;
    }
  }
});

export const { setAlerts, addAlert, acknowledgeAlertInState, setHazardFilter, setSeverityFilter } = alertSlice.actions;
export default alertSlice.reducer;
