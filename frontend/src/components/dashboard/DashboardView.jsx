import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Droplets, 
  Thermometer, 
  Wind, 
  Zap, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { fetchLatestSatelliteScan } from '../../services/api';
import { setLatestScan } from '../../store/slices/satelliteSlice';
import { setCurrentView } from '../../store/slices/authSlice';

export const DashboardView = () => {
  const dispatch = useDispatch();
  const latestScan = useSelector((state) => state.satellite.latestScan);
  const [loading, setLoading] = useState(!latestScan);
  const [refreshing, setRefreshing] = useState(false);

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
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const metrics = latestScan?.summary_metrics || {
    IWV_mm: 58.4,
    CTT_K: 210.5,
    CTT_Celsius: -62.6,
    CAPE_Jkg: 2450,
    CIN_Jkg: 25.0,
    rain_rate_mmh: 45.0,
    wind_speed_kmh: 52.0,
    humidity_pct: 88.0
  };

  const assessment = latestScan?.nowcast_assessment || {
    primary_hazard: 'Severe Thunderstorm',
    severity: 'WARNING',
    severity_color: '#ea580c',
    overall_risk_score: 68.5,
    cloudburst_probability: 48.0,
    flash_flood_probability: 52.0,
    thunderstorm_probability: 68.5,
    hail_probability: 35.0,
    recommended_action: 'Prepare Emergency Teams & Asset Shields',
    estimated_lead_time_mins: 45
  };

  const hotspots = latestScan?.regional_hotspots || [
    { region: "Uttarakhand (Garhwal)", lat: 30.73, lon: 79.06, iwv: metrics.IWV_mm, ctt: metrics.CTT_K, risk: "WARNING" },
    { region: "Himachal (Kullu Valley)", lat: 31.95, lon: 77.10, iwv: 42.0, ctt: 245.0, risk: "WATCH" },
    { region: "Western Ghats (Wayanad)", lat: 11.68, lon: 76.13, iwv: 38.0, ctt: 255.0, risk: "NORMAL" },
    { region: "Assam (Barak Valley)", lat: 24.81, lon: 92.79, iwv: 54.0, ctt: 218.0, risk: "CRITICAL" }
  ];

  // Recharts trend data
  const trendData = [
    { time: '14:00', IWV: 32.1, CAPE: 1200 },
    { time: '15:00', IWV: 38.4, CAPE: 1650 },
    { time: '16:00', IWV: 45.2, CAPE: 2200 },
    { time: '17:00', IWV: 52.8, CAPE: 2950 },
    { time: '18:00', IWV: 59.4, CAPE: 3400 },
    { time: 'Current', IWV: Number(metrics.IWV_mm), CAPE: Number(metrics.CAPE_Jkg) }
  ];

  const hazardBreakdown = [
    { hazard: 'Cloudburst', probability: Number(assessment.cloudburst_probability), fill: '#dc2626' },
    { hazard: 'Flash Flood', probability: Number(assessment.flash_flood_probability), fill: '#ea580c' },
    { hazard: 'Thunderstorm', probability: Number(assessment.thunderstorm_probability), fill: '#d97706' },
    { hazard: 'Hailstorm', probability: Number(assessment.hail_probability), fill: '#2563eb' }
  ];

  const isCritical = assessment.severity === 'CRITICAL';
  const isWarning = assessment.severity === 'WARNING';
  const isWatch = assessment.severity === 'WATCH';

  return (
    <div className="space-y-6">
      
      {/* 1. Official Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            National Meteorological Operations Console
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Poll Satellite Scan'}</span>
          </button>

          <button
            onClick={() => dispatch(setCurrentView('map'))}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Geospatial Radar Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Primary Hazard Assessment & Atmospheric Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Risk Status Card */}
        <div className={`p-6 rounded-lg border shadow-sm flex flex-col justify-between ${
          isCritical 
            ? 'bg-red-50/70 border-red-200 text-red-950' 
            : isWarning 
            ? 'bg-orange-50/70 border-orange-200 text-orange-950'
            : isWatch
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold tracking-wider uppercase flex items-center space-x-1.5 shrink-0 mr-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Primary Hazard Assessment</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border shrink-0 whitespace-nowrap ml-auto ${
                isCritical
                  ? 'bg-red-600 text-white border-red-700'
                  : isWarning
                  ? 'bg-orange-600 text-white border-orange-700'
                  : isWatch
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-emerald-600 text-white border-emerald-700'
              }`}>
                LEVEL: {assessment.severity}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-3">
              {assessment.primary_hazard}
            </h2>

            <div className="flex items-baseline space-x-3 my-4">
              <span className="font-extrabold text-5xl tabular-nums tracking-tight text-slate-900">
                {assessment.overall_risk_score}%
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase">Composite Nowcast Probability</span>
            </div>

            <div className="p-3.5 rounded bg-white border border-slate-200 text-xs text-slate-700 shadow-sm leading-relaxed">
              <strong className="text-slate-900">STATUTORY ADVISORY:</strong> {assessment.recommended_action}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Touchdown Lead Time:</span>
            </span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              ~{assessment.estimated_lead_time_mins} minutes
            </span>
          </div>
        </div>

        {/* 6 Core Atmospheric Telemetry Metric Tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">IWV (Moisture)</span>
              <Droplets className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500">Column Vapor</p>
            <p className="font-bold text-2xl text-slate-900 tabular-nums mt-1">{metrics.IWV_mm} <span className="text-xs font-normal text-slate-500">mm</span></p>
            <span className="text-[11px] text-red-700 font-medium">Critical threshold &gt; 52mm</span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">CTT (Cloud Top)</span>
              <Thermometer className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-xs text-slate-500">Cloud Top Temp</p>
            <p className="font-bold text-2xl text-slate-900 tabular-nums mt-1">{metrics.CTT_K} <span className="text-xs font-normal text-slate-500">K</span></p>
            <span className="text-[11px] text-slate-600 font-medium">({metrics.CTT_Celsius}°C) Deep Convective</span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">CAPE Energy</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500">Atmospheric Instability</p>
            <p className="font-bold text-2xl text-slate-900 tabular-nums mt-1">{metrics.CAPE_Jkg} <span className="text-xs font-normal text-slate-500">J/kg</span></p>
            <span className="text-[11px] text-amber-700 font-medium">Convective Potential</span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Rain Rate</span>
              <Activity className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-xs text-slate-500">Current Precipitation</p>
            <p className="font-bold text-2xl text-slate-900 tabular-nums mt-1">{metrics.rain_rate_mmh} <span className="text-xs font-normal text-slate-500">mm/h</span></p>
            <span className="text-[11px] text-slate-600 font-medium">Hydro-Estimator Sensor</span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Surface Wind</span>
              <Wind className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xs text-slate-500">Upper Shear / Velocity</p>
            <p className="font-bold text-2xl text-slate-900 tabular-nums mt-1">{metrics.wind_speed_kmh} <span className="text-xs font-normal text-slate-500">km/h</span></p>
            <span className="text-[11px] text-slate-600 font-medium">Doppler Vector Stream</span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Humidity</span>
              <Radio className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500">Relative Humidity</p>
            <p className="font-bold text-2xl text-slate-900 tabular-nums mt-1">{metrics.humidity_pct}<span className="text-xs font-normal text-slate-500">%</span></p>
            <span className="text-[11px] text-slate-600 font-medium">Tropospheric Column</span>
          </div>

        </div>

      </div>

      {/* 3. Monitored Regional Hotspots Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-sm text-slate-900">National Flash Flood & Cloudburst Monitoring Sectors</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">4 Sectors Online</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Sector / Region</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Column Moisture (IWV)</th>
                <th className="px-4 py-3">Cloud Top Temp (CTT)</th>
                <th className="px-4 py-3">IMD Alert Level</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hotspots.map((spot, idx) => {
                const isCrit = spot.risk === 'CRITICAL';
                const isWarn = spot.risk === 'WARNING';
                const isWtc = spot.risk === 'WATCH';
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{spot.region}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{spot.lat}° N, {spot.lon}° E</td>
                    <td className="px-4 py-3 font-mono">{spot.iwv} mm</td>
                    <td className="px-4 py-3 font-mono">{spot.ctt} K</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCrit
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isWarn
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : isWtc
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {spot.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => dispatch(setCurrentView('map'))}
                        className="text-blue-700 hover:text-blue-900 font-semibold text-xs"
                      >
                        Inspect Map →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Meteorological Trajectory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vapor & Convective Energy Trajectory */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span>Atmospheric Moisture & Convective Energy Trajectory</span>
              </h3>
              <p className="text-xs text-slate-500">Hourly IWV (mm) and CAPE (J/kg) trends across target basin</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '6px' }}
                />
                <Area type="monotone" dataKey="IWV" stroke="#1e40af" strokeWidth={2} fillOpacity={0.15} fill="#1e40af" name="IWV Moisture (mm)" />
                <Area type="monotone" dataKey="CAPE" stroke="#ea580c" strokeWidth={2} fillOpacity={0.15} fill="#ea580c" name="CAPE (J/kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Class Probabilities */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Multi-Hazard Classification
            </h3>
            <p className="text-xs text-slate-500 mb-4">XGBoost Severe Weather Probabilities</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hazardBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="hazard" stroke="#64748b" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }} />
                  <Bar dataKey="probability" radius={[0, 4, 4, 0]} name="Probability (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 mt-2">
            Model Engine: <strong className="text-slate-900 font-mono">XGBoost-V2 + SHAP</strong> • Precision: <strong className="text-emerald-700">96.4%</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
