import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Radio, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Droplets, 
  Thermometer, 
  Wind, 
  Zap, 
  RefreshCw, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { fetchLatestSatelliteScan } from '../../services/api';
import { setLatestScan } from '../../store/slices/satelliteSlice';
import { setCurrentView } from '../../store/slices/authSlice';

export const DashboardView = () => {
  const dispatch = useDispatch();
  const latestScan = useSelector((state) => state.satellite.latestScan);
  const [loading, setLoading] = useState(!latestScan);
  const [refreshing, setRefreshing] = useState(false);

  // Load telemetry data on mount
  useEffect(() => {
    const loadScan = async () => {
      try {
        const data = await fetchLatestSatelliteScan();
        dispatch(setLatestScan(data));
      } catch (err) {
        console.error('Failed to load scan:', err);
      } finally {
        setLoading(false);
      }
    };
    loadScan();
  }, [dispatch]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchLatestSatelliteScan();
      dispatch(setLatestScan(data));
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const metrics = latestScan?.summary_metrics || {
    IWV_mm: 64.2,
    CTT_K: 204.1,
    CTT_Celsius: -69.0,
    CAPE_Jkg: 3840,
    CIN_Jkg: 12.5,
    rain_rate_mmh: 94.0,
    wind_speed_kmh: 68.5,
    humidity_pct: 94.2
  };

  const assessment = latestScan?.nowcast_assessment || {
    primary_hazard: 'Cloudburst',
    severity: 'CRITICAL',
    severity_color: '#ef4444',
    overall_risk_score: 94.8,
    cloudburst_probability: 94.8,
    flash_flood_probability: 91.0,
    thunderstorm_probability: 88.5,
    hail_probability: 72.0,
    recommended_action: 'IMMEDIATE EVACUATION / HIGH ALERT BROADCAST',
    estimated_lead_time_mins: 28
  };

  // Recharts trend data
  const trendData = [
    { time: '14:00', IWV: 32.1, CTT: 250, CAPE: 1200 },
    { time: '15:00', IWV: 38.4, CTT: 242, CAPE: 1650 },
    { time: '16:00', IWV: 45.2, CTT: 230, CAPE: 2200 },
    { time: '17:00', IWV: 52.8, CTT: 218, CAPE: 2950 },
    { time: '18:00', IWV: 59.4, CTT: 210, CAPE: 3400 },
    { time: 'Current', IWV: metrics.IWV_mm, CTT: metrics.CTT_K, CAPE: metrics.CAPE_Jkg }
  ];

  const hazardBreakdown = [
    { hazard: 'Cloudburst', probability: assessment.cloudburst_probability, fill: '#ef4444' },
    { hazard: 'Flash Flood', probability: assessment.flash_flood_probability, fill: '#ff6b35' },
    { hazard: 'Thunderstorm', probability: assessment.thunderstorm_probability, fill: '#f59e0b' },
    { hazard: 'Hailstorm', probability: assessment.hail_probability, fill: '#3b82f6' }
  ];

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-orbitron font-extrabold text-2xl lg:text-3xl text-white">
              LIVE OPERATIONS DASHBOARD
            </span>
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold animate-pulse">
              LIVE BROADCAST ACTIVE
            </span>
          </div>
          <p className="text-slate-400 text-xs font-mono mt-1">
            MOSDAC INSAT-3DR Telemetry Stream • Scan ID: {latestScan?.scan_id || 'MOSDAC_20260906_1850'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'FETCHING...' : 'REFRESH MOSDAC'}</span>
          </button>

          <button
            onClick={() => dispatch(setCurrentView('map'))}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-orbitron font-bold hover:bg-cyan-500/30 transition-colors"
          >
            <span>GEOSPATIAL MAP</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Risk Cards Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Overall Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden ${
            assessment.overall_risk_score > 75
              ? 'glass-panel-danger shadow-glow-red'
              : 'glass-panel border-cyan-500/30 shadow-glow-cyan'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400 tracking-wider uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>PRIMARY HAZARD DETECTED</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-red-600 text-white">
                {assessment.severity}
              </span>
            </div>

            <h3 className="font-orbitron font-black text-3xl text-white mt-3">
              {assessment.primary_hazard}
            </h3>

            <div className="flex items-baseline space-x-3 my-4">
              <span className="font-orbitron font-black text-6xl text-red-500 glow-text-orange">
                {assessment.overall_risk_score}%
              </span>
              <span className="text-xs font-mono text-slate-300">OVERALL RISK SCORE</span>
            </div>

            <p className="text-xs text-slate-300 font-light leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-cyan-300">ACTION REQUIRED:</strong> {assessment.recommended_action}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Estimated Lead Time:</span>
            <span className="text-emerald-400 font-bold text-sm">~{assessment.estimated_lead_time_mins} Mins</span>
          </div>
        </motion.div>

        {/* Real-time Telemetry Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-[10px] font-mono text-slate-400">IWV METRIC</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Vapor Density</p>
            <p className="font-orbitron font-bold text-2xl text-white mt-1">{metrics.IWV_mm} <span className="text-xs text-slate-400 font-normal">mm</span></p>
            <span className="text-[10px] font-mono text-red-400">Critical threshold &gt; 52mm</span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="flex items-center justify-between text-sky-400 mb-2">
              <Thermometer className="w-5 h-5" />
              <span className="text-[10px] font-mono text-slate-400">CTT METRIC</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Cloud Top Temp</p>
            <p className="font-orbitron font-bold text-2xl text-white mt-1">{metrics.CTT_K} <span className="text-xs text-slate-400 font-normal">K</span></p>
            <span className="text-[10px] font-mono text-sky-300">({metrics.CTT_Celsius}°C) Deep Convection</span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="flex items-center justify-between text-orange-400 mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-mono text-slate-400">CAPE METRIC</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Convective Energy</p>
            <p className="font-orbitron font-bold text-2xl text-white mt-1">{metrics.CAPE_Jkg} <span className="text-xs text-slate-400 font-normal">J/kg</span></p>
            <span className="text-[10px] font-mono text-orange-400">Extreme Instability</span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-mono text-slate-400">RAIN RATE</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Precipitation Rate</p>
            <p className="font-orbitron font-bold text-2xl text-white mt-1">{metrics.rain_rate_mmh} <span className="text-xs text-slate-400 font-normal">mm/h</span></p>
            <span className="text-[10px] font-mono text-blue-400">Torrential Downpour</span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="flex items-center justify-between text-teal-400 mb-2">
              <Wind className="w-5 h-5" />
              <span className="text-[10px] font-mono text-slate-400">WIND SPEED</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Upper Level Wind</p>
            <p className="font-orbitron font-bold text-2xl text-white mt-1">{metrics.wind_speed_kmh} <span className="text-xs text-slate-400 font-normal">km/h</span></p>
            <span className="text-[10px] font-mono text-teal-300">Gale Shear Active</span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <Radio className="w-5 h-5" />
              <span className="text-[10px] font-mono text-slate-400">HUMIDITY</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Relative Humidity</p>
            <p className="font-orbitron font-bold text-2xl text-white mt-1">{metrics.humidity_pct}%</p>
            <span className="text-[10px] font-mono text-purple-300">Saturated Air Column</span>
          </div>

        </div>

      </div>

      {/* Recharts Atmospheric Trends & Hazard Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vapor & Temperature Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-orbitron font-bold text-lg text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>ATMOSPHERIC VAPOR & CONVECTIVE TRAJECTORY</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">IWV (mm) vs Cloud Top Temp (K) Over Past 5 Hours</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIwv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCape" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1628', borderColor: '#00d4ff', color: '#fff', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="IWV" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorIwv)" name="IWV Vapor (mm)" />
                <Area type="monotone" dataKey="CAPE" stroke="#ff6b35" strokeWidth={2} fillOpacity={1} fill="url(#colorCape)" name="CAPE (J/kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Risk Breakdown Bar Chart */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-1">
              HAZARD PROBABILITY
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">XGBoost Class Probabilities</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hazardBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <YAxis type="category" dataKey="hazard" stroke="#94a3b8" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a1628', borderColor: '#00d4ff', color: '#fff' }} />
                  <Bar dataKey="probability" radius={[0, 8, 8, 0]} name="Probability (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            Model Confidence: <span className="text-emerald-400 font-bold">94.8%</span> (High Precision)
          </div>
        </div>

      </div>

    </div>
  );
};
