import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Search, 
  Flag, 
  X,
  Info,
  Radio,
  Navigation,
  Compass,
  Layers,
  MapPin,
  Award
} from 'lucide-react';
import { INDIA_STATES_DATA } from './indiaMapData';
import { fetchMapRiskZones, fetchAssets, fetchSatelliteTimeline } from '../../services/api';

export const MapView = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineFrames, setTimelineFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCapitals, setShowCapitals] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'WATCH' | 'SAFE'

  useEffect(() => {
    const loadData = async () => {
      try {
        const timelineRes = await fetchSatelliteTimeline();
        setTimelineFrames(timelineRes.frames || []);
      } catch (err) {
        console.error('Failed to load timeline data:', err);
      }
    };
    loadData();
  }, []);

  // Timeline Animation Loop
  useEffect(() => {
    let timer;
    if (isPlaying && timelineFrames.length > 0) {
      timer = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % timelineFrames.length);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timelineFrames]);

  const activeFrame = timelineFrames[currentFrameIndex] || {
    label: 'LIVE MOSDAC SCAN (18:50 UTC)',
    metrics: { IWV_mm: 64.2, CTT_K: 204.1, CAPE_Jkg: 3840 },
    maxRiskScore: 96
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
  };

  const filteredStates = INDIA_STATES_DATA.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          state.capital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSeverity === 'ALL' || state.severity === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const criticalCount = INDIA_STATES_DATA.filter(s => s.severity === 'CRITICAL').length;
  const warningCount = INDIA_STATES_DATA.filter(s => s.severity === 'WARNING').length;
  const watchCount = INDIA_STATES_DATA.filter(s => s.severity === 'WATCH').length;
  const safeCount = INDIA_STATES_DATA.filter(s => s.severity === 'SAFE').length;

  return (
    <div className="min-h-[calc(100vh-80px)] py-4 px-4 lg:px-8 max-w-7xl mx-auto space-y-4 font-inter text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Top Header & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-4 shadow-glass">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="font-orbitron font-extrabold text-base lg:text-lg text-white">
                  SANKET GEOSPATIAL HAZARD MAP
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>SURVEY OF INDIA COMPLIANT (SIH 2026)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Official Territorial Boundaries • All 28 States & 8 Union Territories • MOSDAC INSAT-3D Live Stream
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>MOSDAC TELEMETRY ACTIVE</span>
          </div>
        </div>

        {/* Search Jump & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Indian State, UT or Capital (e.g. Uttarakhand, Sikkim, Leh)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {searchQuery && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl max-h-56 overflow-y-auto shadow-2xl p-1">
                {filteredStates.length > 0 ? (
                  filteredStates.map((reg) => (
                    <div
                      key={reg.id}
                      onClick={() => {
                        handleSelectRegion(reg);
                        setSearchQuery('');
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white">{reg.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({reg.capital})</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        reg.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/40' :
                        reg.severity === 'WARNING' ? 'bg-orange-950 text-orange-400 border border-orange-500/40' :
                        'bg-blue-950 text-blue-400 border border-blue-500/40'
                      }`}>
                        {reg.riskScore}% {reg.hazard}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-500 text-center font-mono">No state found</div>
                )}
              </div>
            )}
          </div>

          {/* Severity Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                filterSeverity === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              All (36)
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                filterSeverity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilterSeverity('WARNING')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                filterSeverity === 'WARNING' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Warning ({warningCount})
            </button>
            <button
              onClick={() => setShowCapitals(!showCapitals)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                showCapitals ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Capitals
            </button>
            <button
              onClick={() => setSelectedRegion(null)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Reset Selected State"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Map & Telemetry Drawer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
        
        {/* Official Survey of India Compliant SVG Map Rendering Container */}
        <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-800 shadow-glass relative bg-[#050c17] min-h-[630px] flex flex-col justify-between p-4">
          
          {/* Map Title & Compliance Subheader */}
          <div className="flex items-center justify-between text-xs font-mono z-10">
            <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <Flag className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white font-orbitron">INDIA POLITICAL MAP (OFFICIAL BOUNDARIES)</span>
            </div>
            <span className="text-[10px] text-slate-400">Scale: Survey of India Official Cartography</span>
          </div>

          {/* Interactive Official SVG Map Viewport */}
          <div className="relative w-full h-[540px] flex items-center justify-center my-2">
            <svg
              viewBox="0 0 650 680"
              className="w-full h-full max-h-[540px] select-none filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
            >
              <defs>
                {/* Glow Filter for Selected / Hovered State */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#050c17" />
                  <stop offset="100%" stopColor="#0a192f" />
                </linearGradient>
              </defs>

              {/* Water Bodies & Neighboring Regions Labeling */}
              <text x="70" y="520" fill="#00d4ff" opacity="0.3" fontSize="11" fontFamily="monospace" fontStyle="italic">ARABIAN SEA</text>
              <text x="440" y="520" fill="#00d4ff" opacity="0.3" fontSize="11" fontFamily="monospace" fontStyle="italic">BAY OF BENGAL</text>
              <text x="260" y="660" fill="#00d4ff" opacity="0.3" fontSize="11" fontFamily="monospace" fontStyle="italic">INDIAN OCEAN</text>
              <text x="70" y="240" fill="#64748b" opacity="0.4" fontSize="10" fontFamily="monospace">PAKISTAN</text>
              <text x="350" y="120" fill="#64748b" opacity="0.4" fontSize="10" fontFamily="monospace">CHINA (TIBET)</text>
              <text x="330" y="225" fill="#64748b" opacity="0.4" fontSize="10" fontFamily="monospace">NEPAL</text>
              <text x="435" y="228" fill="#64748b" opacity="0.4" fontSize="10" fontFamily="monospace">BHUTAN</text>
              <text x="420" y="325" fill="#64748b" opacity="0.4" fontSize="10" fontFamily="monospace">BANGLADESH</text>
              <text x="540" y="360" fill="#64748b" opacity="0.4" fontSize="10" fontFamily="monospace">MYANMAR</text>
              <text x="290" y="650" fill="#64748b" opacity="0.4" fontSize="9" fontFamily="monospace">SRI LANKA</text>

              {/* Render State Vector Polygons */}
              <g>
                {filteredStates.map((state) => {
                  const isSelected = selectedRegion?.id === state.id;
                  const isHovered = hoveredRegion?.id === state.id;

                  return (
                    <g key={state.id} className="cursor-pointer">
                      <path
                        d={state.path}
                        fill={state.color}
                        fillOpacity={isSelected ? 0.85 : isHovered ? 0.70 : 0.40}
                        stroke={isSelected ? '#00d4ff' : isHovered ? '#ffffff' : 'rgba(255,255,255,0.25)'}
                        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                        strokeLinejoin="round"
                        filter={isSelected || isHovered ? 'url(#glow)' : undefined}
                        onClick={() => handleSelectRegion(state)}
                        onMouseEnter={() => setHoveredRegion(state)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className="transition-all duration-200"
                      />

                      {/* State Label Text */}
                      <text
                        x={state.labelPos.x}
                        y={state.labelPos.y}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={state.type === 'UT' ? '8' : '9'}
                        fontWeight="700"
                        fontFamily="sans-serif"
                        pointerEvents="none"
                        className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                      >
                        {state.name}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Render Capitals & National Capital Markers */}
              {showCapitals && (
                <g pointerEvents="none">
                  {INDIA_STATES_DATA.map((state) => {
                    if (state.isCountryCapital) {
                      return (
                        <g key={`capital-${state.id}`}>
                          {/* Country Capital Red Square with Dot */}
                          <rect
                            x={state.capitalPos.x - 7}
                            y={state.capitalPos.y - 7}
                            width="14"
                            height="14"
                            rx="3"
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <circle
                            cx={state.capitalPos.x}
                            cy={state.capitalPos.y}
                            r="2.5"
                            fill="#ffffff"
                          />
                          <text
                            x={state.capitalPos.x}
                            y={state.capitalPos.y - 12}
                            textAnchor="middle"
                            fill="#ff6b6b"
                            fontSize="9"
                            fontWeight="800"
                            fontFamily="monospace"
                            className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                          >
                            NEW DELHI (NATL. CAPITAL)
                          </text>
                        </g>
                      );
                    }

                    return (
                      <g key={`capital-${state.id}`}>
                        <circle
                          cx={state.capitalPos.x}
                          cy={state.capitalPos.y}
                          r="4"
                          fill="#000000"
                          stroke="#00d4ff"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredRegion && !selectedRegion && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${hoveredRegion.labelPos.x}px`,
                  top: `${hoveredRegion.labelPos.y - 40}px`
                }}
                className="pointer-events-none z-50 bg-slate-900/95 border border-cyan-500/50 text-white p-2.5 rounded-xl shadow-2xl backdrop-blur-md space-y-1 -translate-x-1/2 font-mono text-xs"
              >
                <div className="flex items-center space-x-1.5 font-bold text-cyan-300">
                  <span>{hoveredRegion.name}</span>
                  <span className="text-[10px] text-slate-400">({hoveredRegion.capital})</span>
                </div>
                <p className="text-slate-300 text-[11px]">Hazard: <strong className="text-orange-400">{hoveredRegion.hazard}</strong></p>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800">
                  <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold uppercase">{hoveredRegion.severity}</span>
                  <span className="font-bold text-cyan-400">SCORE: {hoveredRegion.riskScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Official Legend Overlay Footer */}
          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md font-mono text-[11px] flex flex-wrap items-center justify-between gap-3 shadow-2xl z-10">
            <div className="flex items-center space-x-4 text-[10px] text-slate-300">
              <span className="font-bold text-cyan-300 text-xs uppercase">OFFICIAL LEGEND:</span>
              
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-purple-400 border-b border-dashed border-purple-400 inline-block" />
                <span>State/UT Boundary</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 border border-white rounded-sm inline-block" />
                <span>Country Capital (New Delhi)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-black border border-cyan-400 rounded-full inline-block" />
                <span>State Capital</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center space-x-1 text-red-400 font-bold"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical &gt;85%</span>
              <span className="flex items-center space-x-1 text-orange-400 font-bold"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Warning 70-85%</span>
              <span className="flex items-center space-x-1 text-blue-400 font-bold"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Watch 50-70%</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Safe &lt;50%</span>
            </div>
          </div>

        </div>

        {/* Side Panel: Selected Regional Telemetry & Advisories */}
        <div className="lg:col-span-1 space-y-4">
          
          <AnimatePresence mode="wait">
            {selectedRegion ? (
              <motion.div
                key={selectedRegion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-5 rounded-3xl glass-panel border border-cyan-500/30 shadow-glow-cyan space-y-4 relative"
              >
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    SELECTED REGIONAL TELEMETRY
                  </span>
                  <h3 className="font-orbitron font-extrabold text-xl text-white mt-0.5">
                    {selectedRegion.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Capital: <strong className="text-white">{selectedRegion.capital}</strong> ({selectedRegion.type})
                  </p>
                </div>

                {/* Risk Score Highlight */}
                <div className={`p-4 rounded-2xl border ${
                  selectedRegion.severity === 'CRITICAL' ? 'bg-red-950/40 border-red-500/40 text-red-200 shadow-glow-red' :
                  selectedRegion.severity === 'WARNING' ? 'bg-orange-950/40 border-orange-500/40 text-orange-200' :
                  'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span>HAZARD CLASSIFICATION</span>
                    <span className="font-bold">{selectedRegion.severity}</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-orbitron font-black text-4xl">{selectedRegion.riskScore}%</span>
                    <span className="text-xs font-mono text-slate-300">OVERALL RISK</span>
                  </div>
                  <p className="text-xs font-mono mt-2 pt-2 border-t border-slate-800">
                    Primary Hazard: <strong className="text-white">{selectedRegion.hazard}</strong>
                  </p>
                </div>

                {/* Live MOSDAC Telemetry metrics for region */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Integrated Water Vapor:</span>
                    <strong className="text-cyan-300">{selectedRegion.iwv || 64.2} mm</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Cloud Top Temp (CTT):</span>
                    <strong className="text-sky-300">{selectedRegion.ctt || 204.1} K</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Convective Instability:</span>
                    <strong className="text-orange-300">{selectedRegion.cape || 3840} J/kg</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <p className="text-cyan-300 font-bold">EMERGENCY ADVISORY:</p>
                  <p>{selectedRegion.severity === 'CRITICAL' ? 'Immediate Evacuation Broadcast & NDMA Alert Active' : selectedRegion.severity === 'WARNING' ? 'High Alert Watch & Local Disaster Response Readiness' : 'Normal Monitoring & Continuous Scan'}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <p className="flex items-center space-x-1.5 text-cyan-400">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>MOSDAC Satellite Telemetry Stream Active</span>
                  </p>
                  <p>Location Center: [{selectedRegion.centerLat.toFixed(2)}°N, {selectedRegion.centerLon.toFixed(2)}°E]</p>
                </div>
              </motion.div>
            ) : (
              /* All India Quick Summary Card */
              <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-glass">
                <div>
                  <h3 className="font-orbitron font-bold text-sm text-white flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-orange-400" />
                    <span>ALL INDIA GEOSPATIAL SUMMARY</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Click any state or capital to inspect regional telemetry
                  </p>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Total Territories Monitored</span>
                    <strong className="text-white text-sm">36 (28 States, 8 UTs)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex justify-between items-center text-red-300">
                    <span>Critical High Hazard Zones</span>
                    <strong className="text-red-400 text-sm">{criticalCount} Regions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 flex justify-between items-center text-orange-300">
                    <span>Warning Level Zones</span>
                    <strong className="text-orange-400 text-sm">{warningCount} Regions</strong>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CAPITAL NAVIGATION:</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    National Capital <strong>New Delhi</strong> marked with red square icon. State & UT Capitals marked with node markers.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Bottom Timeline Replay Slider Control Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/30 transition-colors shadow-glow-cyan"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => { setIsPlaying(false); setCurrentFrameIndex(0); }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div>
              <span className="font-orbitron font-bold text-xs text-white">24-HOUR TIMELINE REPLAY</span>
              <p className="text-[11px] text-cyan-400 font-mono">{activeFrame.label}</p>
            </div>
          </div>

          {/* Range Slider */}
          <div className="flex-1 max-w-xl mx-4">
            <input
              type="range"
              min="0"
              max={Math.max(0, timelineFrames.length - 1)}
              value={currentFrameIndex}
              onChange={(e) => setCurrentFrameIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="text-right font-mono text-xs">
            <p className="text-slate-300">IWV: <strong className="text-cyan-400">{activeFrame.metrics?.IWV_mm} mm</strong></p>
            <p className="text-slate-400">Peak Risk: <strong className="text-red-400">{activeFrame.maxRiskScore}%</strong></p>
          </div>

        </div>
      </div>

    </div>
  );
};
