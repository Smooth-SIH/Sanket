import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertTriangle, ShieldCheck, Activity, Gauge } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';

export const LivePreview = () => {
  const dispatch = useDispatch();
  const [iwvVal, setIwvVal] = useState(62.4);
  const [cttVal, setCttVal] = useState(206.5);

  const calculateRisk = () => {
    const r = Math.min(98.5, (iwvVal / 65.0) * 45 + ((240 - cttVal) / 40.0) * 55);
    return Math.round(r * 10) / 10;
  };

  const riskScore = calculateRisk();

  return (
    <section className="py-20 relative bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-orbitron text-3xl font-bold text-white tracking-tight">
            INTERACTIVE NOWCAST SIMULATOR
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Adjust INSAT-3D sounder parameters below to test real-time XGBoost risk predictions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-glow-cyan">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">
                  INSAT-3DR MOSDAC LIVE SIMULATOR
                </h3>
                <p className="text-xs text-slate-400 font-mono">Scan ID: MOSDAC_20260906_1850</p>
              </div>
            </div>

            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-orbitron font-bold hover:bg-cyan-500/30 transition-colors"
            >
              LAUNCH FULL DASHBOARD
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Interactive Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300">Integrated Water Vapor (IWV)</span>
                  <span className="text-cyan-400 font-bold">{iwvVal} mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="0.5"
                  value={iwvVal}
                  onChange={(e) => setIwvVal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300">Cloud Top Temp (CTT)</span>
                  <span className="text-sky-300 font-bold">{cttVal} K ({Math.round(cttVal - 273.15)}°C)</span>
                </div>
                <input
                  type="range"
                  min="190"
                  max="280"
                  step="0.5"
                  value={cttVal}
                  onChange={(e) => setCttVal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
                <p>Derived Index: CAPE ~ 3,450 J/kg</p>
                <p>Radar Rain Rate: ~ {(iwvVal * 1.2).toFixed(1)} mm/h</p>
                <p>Location: Uttarakhand Garhwal Sector</p>
              </div>
            </div>

            {/* Simulated Prediction Card */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
              riskScore > 75 
                ? 'bg-red-950/40 border-red-500/50 text-red-200' 
                : riskScore > 45 
                ? 'bg-orange-950/40 border-orange-500/50 text-orange-200' 
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    XGBoost Model Prediction
                  </span>
                  <Activity className="w-5 h-5 animate-spin text-cyan-400" />
                </div>

                <div className="flex items-baseline space-x-3 my-2">
                  <span className="font-orbitron text-5xl font-black">{riskScore}%</span>
                  <span className="font-mono text-sm font-bold">OVERALL RISK SCORE</span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Hazard Type:</span>
                    <strong className="font-bold">{riskScore > 70 ? 'Cloudburst' : 'Severe Thunderstorm'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Severity Classification:</span>
                    <strong className="font-bold">{riskScore > 75 ? 'CRITICAL' : riskScore > 45 ? 'WARNING' : 'WATCH'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Lead Time:</span>
                    <strong className="font-mono">{riskScore > 50 ? '28 - 45 Minutes' : 'Normal'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono">
                Status: {riskScore > 75 ? '🚨 Evacuation Advisory Dispatched' : '✅ Continuous Monitoring'}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
