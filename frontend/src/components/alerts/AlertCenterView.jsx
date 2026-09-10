import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, Filter, UserCheck, BellRing } from 'lucide-react';
import { fetchAlerts, acknowledgeAlertApi } from '../../services/api';
import { setAlerts, acknowledgeAlertInState } from '../../store/slices/alertSlice';

export const AlertCenterView = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.alerts);
  const [selectedHazard, setSelectedHazard] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [officerNameInput, setOfficerNameInput] = useState('Duty Officer (SDMA)');

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        dispatch(setAlerts(data.alerts || []));
      } catch (err) {
        console.error('Failed to load alerts:', err);
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
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <h1 className="font-bold text-xl text-slate-900">
              National Meteorological Emergency & Alert Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nowcast Severe Hazard Warnings • Dispatched to State Disaster Management Authorities (SDMA)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>PENDING ACTION: {activeCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            CRITICAL TOTAL: <strong className="text-slate-900">{criticalCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Bar */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Hazard Categories */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {['ALL', 'Cloudburst', 'Flash Flood', 'Severe Thunderstorm', 'Hailstorm'].map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHazard(h)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedHazard === h
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                selectedSeverity === s
                  ? 'bg-slate-800 text-white font-semibold border-slate-800'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-white border border-slate-200 text-slate-500 text-xs">
            No alerts match current category filter parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-lg border transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-50/50 border-red-300 shadow-sm'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      alert.severity === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-yellow-400 text-slate-900'
                    }`}>
                      IMD {alert.severity}
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      Hazard: {alert.hazardType}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {alert.id}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-600">
                    Target Jurisdiction / District: <strong className="text-slate-900">{alert.affectedRegion}</strong>
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-600 font-mono">
                    <span>IWV: <strong className="text-slate-900">{alert.parameters?.IWV_mm || 58.4} mm</strong></span>
                    <span>CTT: <strong className="text-slate-900">{alert.parameters?.CTT_K || 208.5} K</strong></span>
                    <span>CAPE: <strong className="text-slate-900">{alert.parameters?.CAPE_Jkg || 3200} J/kg</strong></span>
                    <span>Estimated Lead Time: <strong className="text-blue-700 font-semibold">~{alert.leadTimeMins} Mins</strong></span>
                  </div>
                </div>

                {/* Acknowledgment Button / Status */}
                <div>
                  {alert.acknowledged ? (
                    <div className="p-3 rounded-md bg-white border border-emerald-200 text-right space-y-0.5">
                      <span className="flex items-center space-x-1 text-emerald-700 text-xs font-bold justify-end">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ACKNOWLEDGED</span>
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Officer: {alert.acknowledgedBy}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAckModalAlert(alert)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>ACKNOWLEDGE BULLETIN</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="p-6 rounded-lg bg-white border border-slate-300 shadow-xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Confirm Receipt & Acknowledgment
            </h3>

            <p className="text-xs text-slate-600">
              Logging official duty acknowledgment for Bulletin Ref <strong>{ackModalAlert.id}</strong> ({ackModalAlert.hazardType} in {ackModalAlert.affectedRegion}).
            </p>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Officer Name & SDMA Command Post</label>
              <input
                type="text"
                value={officerNameInput}
                onChange={(e) => setOfficerNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAckModalAlert(null)}
                className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm"
              >
                Submit Acknowledgment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
