import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, ShieldAlert } from 'lucide-react';
import { fetchMapRiskZones, fetchAssets, fetchSatelliteTimeline } from '../../services/api';

// Leaflet Map Resize Helper Component
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Custom Marker Icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #050c17; box-shadow: 0 0 12px ${color};"></div>`,
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
        if (timelineRes.frames && timelineRes.frames.length > 0) {
          setCurrentFrameIndex(timelineRes.frames.length - 1);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
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
    label: 'LIVE SCAN (18:50 UTC)',
    metrics: { IWV_mm: 64.2, CTT_K: 204.1, CAPE_Jkg: 3840 },
    maxRiskScore: 94
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-4 px-4 lg:px-8 max-w-7xl mx-auto space-y-4">
      
      {/* Top Map Header & Controls */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-base text-white">SANKET GEOSPATIAL HAZARD MAP</h2>
            <p className="text-xs text-cyan-400/80 font-mono">INSAT-3D Spatial Overlays &bull; India Political Tactical Map</p>
          </div>
        </div>

        {/* Layer Toggle Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              showPolygons ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Polygon Hazards ({riskZones.length})
          </button>

          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              showAssets ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Infrastructure Assets ({assets.length})
          </button>
        </div>

      </div>

      {/* Leaflet Map Container */}
      <div className="w-full rounded-3xl overflow-hidden border border-slate-800 shadow-glass relative">
        <MapContainer
          center={[24.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '650px' }}
        >
          <MapResizeHandler />

          {/* High-Definition Keyless Dark Base Map */}
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />
          
          {/* High Visibility Political International Borders & Region Labels */}
          <TileLayer
            attribution=''
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
            className="map-tiles-borders"
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
                  fillOpacity: 0.4,
                  weight: 2.5
                }}
              >
                <Popup>
                  <div className="p-2 font-inter text-xs space-y-1">
                    <h4 className="font-orbitron font-bold text-cyan-400 text-sm">{feature.properties.name}</h4>
                    <p className="text-slate-300">Hazard: <strong className="text-white">{feature.properties.hazard}</strong></p>
                    <p className="text-slate-300">IWV Accumulation: <strong className="text-cyan-300">{feature.properties.iwv} mm</strong></p>
                    <p className="text-slate-300">Cloud Top Temp: <strong className="text-sky-300">{feature.properties.ctt} K</strong></p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">
                      {feature.properties.severity} HAZARD ZONE
                    </span>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Infrastructure Asset Markers */}
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
                  <p className="text-slate-400">Hazard Distance: <strong className="text-orange-400">{asset.distanceToHazardKm} km</strong></p>
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
      <div className="p-4 rounded-2xl glass-panel border border-slate-800">
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
            <p className="text-slate-400">Risk: <strong className="text-red-400">{activeFrame.maxRiskScore}%</strong></p>
          </div>

        </div>
      </div>

    </div>
  );
};
