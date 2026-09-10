import React, { useState } from 'react';
import { Radio, Activity, ArrowRight, Sliders } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';

export const LivePreview = () => {
  const dispatch = useDispatch();
  const [iwvVal, setIwvVal] = useState(58.4);
  const [cttVal, setCttVal] = useState(212.0);

  const calculateRisk = () => {
    const r = Math.min(98.5, (iwvVal / 65.0) * 45 + ((240 - cttVal) / 40.0) * 55);
    return Math.round(r * 10) / 10;
  };

  const riskScore = calculateRisk();
  const isCritical = riskScore > 75;
  const isWarning = riskScore > 45;

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Interactive Testbed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
            Atmospheric Sounder Nowcasting Simulator
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Simulate variations in tropospheric moisture and cloud top thermal readings to observe XGBoost risk response.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-lg bg-white border border-slate-200 shadow-sm">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  INSAT-3DR Telemetry Control Panel
                </h3>
                <p className="text-xs text-slate-500 font-mono">Sector: Garhwal Himalayas (30.73° N, 79.06° E)</p>
              </div>
            </div>

            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1"
            >
              <span>Launch Full Ops Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Interactive Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700">Column Vapor Density (IWV)</span>
                  <span className="text-blue-700 font-mono">{iwvVal} mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="0.5"
                  value={iwvVal}
                  onChange={(e) => setIwvVal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <span className="text-[11px] text-slate-500">Normal: &lt; 40mm • Convective Surge: &gt; 52mm</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700">Cloud Top Temperature (CTT)</span>
                  <span className="text-slate-900 font-mono">{cttVal} K ({Math.round(cttVal - 273.15)}°C)</span>
                </div>
                <input
                  type="range"
                  min="190"
                  max="280"
                  step="0.5"
                  value={cttVal}
                  onChange={(e) => setCttVal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <span className="text-[11px] text-slate-500">Normal: &gt; 240K • Deep Convective Overshoot: &lt; 220K</span>
              </div>

              <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
                <p>• Estimated CAPE: ~ 2,850 J/kg</p>
                <p>• Rain Intensity Proxy: ~ {(iwvVal * 0.9).toFixed(1)} mm/h</p>
                <p>• Lead Time Window: ~ 35 - 45 Minutes</p>
              </div>
            </div>

            {/* Model Output Card */}
            <div className={`p-6 rounded-lg border shadow-sm flex flex-col justify-between ${
              isCritical 
                ? 'bg-red-50 border-red-200 text-red-950' 
                : isWarning 
                ? 'bg-orange-50 border-orange-200 text-orange-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Model Inference Output
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isCritical
                      ? 'bg-red-600 text-white border-red-700'
                      : isWarning
                      ? 'bg-orange-600 text-white border-orange-700'
                      : 'bg-emerald-600 text-white border-emerald-700'
                  }`}>
                    {isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL'}
                  </span>
                </div>

                <div className="flex items-baseline space-x-3 my-2">
                  <span className="text-4xl font-extrabold tabular-nums tracking-tight">{riskScore}%</span>
                  <span className="text-xs font-semibold uppercase opacity-80">Composite Risk Score</span>
                </div>

                <div className="mt-4 space-y-2 text-xs divide-y divide-black/5">
                  <div className="flex justify-between pt-1.5">
                    <span>Hazard Classification:</span>
                    <strong>{riskScore > 70 ? 'Severe Cloudburst' : 'Thunderstorm & Hail'}</strong>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span>Statutory Alert Level:</span>
                    <strong>{isCritical ? 'IMD Red Alert' : isWarning ? 'IMD Orange Alert' : 'IMD Green Watch'}</strong>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span>Action Protocol:</span>
                    <strong>{isCritical ? 'Evacuation Broadcast' : isWarning ? 'Standby Teams' : 'Surveillance'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-black/10 text-xs font-medium">
                {isCritical ? '⚠ Immediate Multi-Agency Broadcast Recommended' : '✓ Atmosphere Within Manageable Parameters'}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
