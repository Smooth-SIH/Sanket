import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, Layers, ShieldAlert, Navigation } from 'lucide-react';
import { fetchMapRiskZones, fetchAssets, fetchSatelliteTimeline } from '../../services/api';

// Custom Map Marker Icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #050c17; box-shadow: 0 0 12px ${color}; animate: pulse 2s infinite;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export const MapView = () => {
  const [riskZones, setRiskZones] = useState([]);
  const [assets, setAssets] = useState([]);
  const [timelineFrames, setTimelineFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Layer Toggles
  const [showPolygons, setShowPolygons] = useState(true);
  const [showAssets, setShowAssets] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [zonesRes, assetsRes, timelineRes] = await Promise.all([
          fetchMapRiskZones(),
          fetchAssets(),
          fetchSatelliteTimeline()
        ]);
        setRiskZones(zonesRes.features || []);
        setAssets(assetsRes.assets || []);
        setTimelineFrames(timelineRes.frames || []);
        setCurrentFrameIndex((timelineRes.frames || []).length - 1);
      } catch (err) {
        console.error('Failed to load map data:', err);
      }
    };
    loadData();
  }, []);

  // Timeline Slider Animation Loop
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
    label: 'LIVE SCAN (18:50 UTC)',
    metrics: { IWV_mm: 64.2, CTT_K: 204.1, CAPE_Jkg: 3840 },
    maxRiskScore: 94
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative flex flex-col">
      
      {/* Top Floating Map Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        
        <div className="glass-panel p-3 rounded-2xl border border-cyan-500/30 shadow-glow-cyan pointer-events-auto flex items-center space-x-3">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-orbitron font-bold text-sm text-white">SANKET GEOSPATIAL HAZARD MAP</h2>
            <p className="text-[11px] text-slate-400 font-mono">INSAT-3D 2DSphere Spatial Overlays</p>
          </div>
        </div>

        {/* Layer Toggle Chips */}
        <div className="glass-panel p-2 rounded-2xl border border-slate-800 pointer-events-auto flex items-center space-x-2">
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              showPolygons ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            Polygon Hazards ({riskZones.length})
          </button>

          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              showAssets ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400'
            }`}
          >
            Infrastructure Assets ({assets.length})
          </button>
        </div>

      </div>

      {/* Leaflet Map Container */}
      <div className="flex-1 w-full h-[650px] relative z-0">
        <MapContainer
          center={[28.0, 80.0]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* CartoDB Dark Basemap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Risk Zone Polygons */}
          {showPolygons && riskZones.map((feature) => {
            const coords = feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
            return (
              <Polygon
                key={feature.properties.id}
                positions={coords}
                pathOptions={{
                  color: feature.properties.color || '#ef4444',
                  fillColor: feature.properties.color || '#ef4444',
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: '4'
                }}
              >
                <Popup>
                  <div className="p-2 font-inter text-xs space-y-1">
                    <h4 className="font-orbitron font-bold text-cyan-400 text-sm">{feature.properties.name}</h4>
                    <p className="text-slate-300">Hazard: <strong className="text-white">{feature.properties.hazard}</strong></p>
                    <p className="text-slate-300">IWV Accumulation: <strong className="text-cyan-300">{feature.properties.iwv} mm</strong></p>
                    <p className="text-slate-300">Cloud Top Temp: <strong className="text-sky-300">{feature.properties.ctt} K</strong></p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      {feature.properties.severity} HAZARD ZONE
                    </span>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Asset Markers */}
          {showAssets && assets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.lat, asset.lon]}
              icon={createCustomIcon(
                asset.currentRiskStatus === 'EVACUATION_REQUIRED' ? '#ef4444' :
                asset.currentRiskStatus === 'HIGH_DANGER' ? '#ff6b35' :
                asset.currentRiskStatus === 'MODERATE' ? '#f59e0b' : '#10b981'
              )}
            >
              <Popup>
                <div className="p-2 font-inter text-xs space-y-1">
                  <h4 className="font-orbitron font-bold text-white text-sm">{asset.name}</h4>
                  <p className="text-slate-400">Category: <strong className="text-slate-200">{asset.category}</strong></p>
                  <p className="text-slate-400">Region: <strong className="text-slate-200">{asset.region}</strong></p>
                  <p className="text-slate-400">Hazard Proximity: <strong className="text-orange-400">{asset.distanceToHazardKm} km</strong></p>
                  <div className="mt-2 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-cyan-500/30">
                      STATUS: {asset.currentRiskStatus}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>

      {/* Bottom Timeline Replay Slider Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] glass-panel p-4 rounded-2xl border border-slate-800 pointer-events-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/30 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => { setIsPlaying(false); setCurrentFrameIndex(0); }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div>
              <span className="font-orbitron font-bold text-xs text-white">24-HOUR TIMELINE REPLAY</span>
              <p className="text-[11px] text-cyan-400 font-mono">{activeFrame.label}</p>
            </div>
          </div>

          {/* Timeline Range Slider */}
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
            <p className="text-slate-400">Risk: <strong className="text-red-400">{activeFrame.maxRiskScore}%</strong></p>
          </div>

        </div>
      </div>

    </div>
  );
};
