import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, ShieldAlert, Filter, Clock, Check, UserCheck } from 'lucide-react';
import { fetchAlerts, acknowledgeAlertApi } from '../../services/api';
import { setAlerts, acknowledgeAlertInState } from '../../store/slices/alertSlice';

export const AlertCenterView = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.alerts);
  const [selectedHazard, setSelectedHazard] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [officerNameInput, setOfficerNameInput] = useState('Commander Rawat (NDRF)');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        dispatch(setAlerts(data.alerts || []));
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, [dispatch]);

  const handleAcknowledge = async () => {
    if (!ackModalAlert) return;
    try {
      await acknowledgeAlertApi(ackModalAlert.id, officerNameInput);
      dispatch(acknowledgeAlertInState({ id: ackModalAlert.id, officerName: officerNameInput }));
      setAckModalAlert(null);
    } catch (err) {
      console.error('Acknowledgment error:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (selectedHazard !== 'ALL' && a.hazardType.toLowerCase() !== selectedHazard.toLowerCase()) return false;
    if (selectedSeverity !== 'ALL' && a.severity.toLowerCase() !== selectedSeverity.toLowerCase()) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl lg:text-3xl text-white">
            EMERGENCY ALERT CENTER
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Severe Atmospheric Hazard Notifications & Command Dispatch
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>UNACKNOWLEDGED: {activeCount}</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono">
            CRITICAL TOTAL: {criticalCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Hazard Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['ALL', 'Cloudburst', 'Flash Flood', 'Severe Thunderstorm', 'Hailstorm'].map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHazard(h)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
                selectedHazard === h
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                selectedSeverity === s
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel text-slate-500 font-mono text-xs">
            No alerts match current category filter parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'glass-panel-danger border-red-500/40 shadow-glow-red'
                  : alert.severity === 'WARNING'
                  ? 'glass-panel border-orange-500/40'
                  : 'glass-panel border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' :
                      alert.severity === 'WARNING' ? 'bg-orange-600 text-white' : 'bg-yellow-600 text-black'
                    }`}>
                      {alert.severity}
                    </span>

                    <span className="text-xs font-mono text-cyan-400">
                      Hazard: {alert.hazardType}
                    </span>

                    <span className="text-xs font-mono text-slate-500">
                      ID: {alert.id}
                    </span>
                  </div>

                  <h3 className="font-orbitron font-bold text-lg text-white">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-300">
                    Affected Region: <strong className="text-cyan-300">{alert.affectedRegion}</strong>
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400">
                    <span>IWV: <strong className="text-cyan-400">{alert.parameters?.IWV_mm || 58.4} mm</strong></span>
                    <span>CTT: <strong className="text-sky-300">{alert.parameters?.CTT_K || 208.5} K</strong></span>
                    <span>CAPE: <strong className="text-orange-400">{alert.parameters?.CAPE_Jkg || 3200} J/kg</strong></span>
                    <span>Lead Time: <strong className="text-emerald-400">~{alert.leadTimeMins} Mins</strong></span>
                  </div>
                </div>

                {/* Acknowledgment Button / Status */}
                <div>
                  {alert.acknowledged ? (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-right space-y-1">
                      <span className="flex items-center space-x-1 text-emerald-400 text-xs font-mono font-bold justify-end">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ACKNOWLEDGED</span>
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        By: {alert.acknowledgedBy}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAckModalAlert(alert)}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-orbitron font-bold text-xs hover:from-red-500 hover:to-orange-500 transition-all shadow-glow-orange"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>ACKNOWLEDGE ALERT</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Acknowledgment Modal */}
      {ackModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/40 max-w-md w-full space-y-4">
            <h3 className="font-orbitron font-bold text-lg text-white">
              ACKNOWLEDGE SEVERE ALERT
            </h3>

            <p className="text-xs text-slate-300 font-mono">
              Confirming command receipt for alert ID: {ackModalAlert.id} ({ackModalAlert.hazardType})
            </p>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Officer Name / Designation</label>
              <input
                type="text"
                value={officerNameInput}
                onChange={(e) => setOfficerNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setAckModalAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
              >
                CANCEL
              </button>

              <button
                onClick={handleAcknowledge}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-orbitron font-bold text-xs hover:bg-cyan-400"
              >
                CONFIRM ACKNOWLEDGMENT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
