import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, ShieldAlert, Layers, MapPin } from 'lucide-react';
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

// Custom Marker Icons for Government GIS Console
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.35);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
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
    metrics: { IWV_mm: 58.4, CTT_K: 210.5, CAPE_Jkg: 2450 },
    maxRiskScore: 68
  };

  return (
    <div className="space-y-4">
      
      {/* Top Map Header & Controls */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">National Geospatial Hazard & Radar Console</h2>
            <p className="text-xs text-slate-500 font-mono">INSAT-3D Spatial Soundings • Survey of India Base Layer</p>
          </div>
        </div>

        {/* Layer Toggle Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              showPolygons ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hazard Polygons ({riskZones.length})
          </button>

          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              showAssets ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Monitored Assets ({assets.length})
          </button>
        </div>

      </div>

      {/* Leaflet Map Container */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
        <MapContainer
          center={[24.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '620px' }}
        >
          <MapResizeHandler />

          {/* Clean Institutional Light Base Map */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={18}
          />

          {/* Risk Zone Polygons */}
          {showPolygons && riskZones.map((feature) => {
            const coords = feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
            const isRed = feature.properties.severity === 'CRITICAL';
            const color = isRed ? '#dc2626' : '#ea580c';

            return (
              <Polygon
                key={feature.properties.id}
                positions={coords}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.35,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 font-inter text-xs space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{feature.properties.name}</h4>
                    <p className="text-slate-600">Hazard: <strong className="text-slate-900">{feature.properties.hazard}</strong></p>
                    <p className="text-slate-600">Column Vapor: <strong>{feature.properties.iwv} mm</strong></p>
                    <p className="text-slate-600">Cloud Top Temp: <strong>{feature.properties.ctt} K</strong></p>
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
                asset.currentRiskStatus === 'EVACUATION_REQUIRED' ? '#dc2626' :
                asset.currentRiskStatus === 'HIGH_DANGER' ? '#ea580c' :
                asset.currentRiskStatus === 'MODERATE' ? '#d97706' : '#16a34a'
              )}
            >
              <Popup>
                <div className="p-1 font-inter text-xs space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{asset.name}</h4>
                  <p className="text-slate-600">Category: <strong>{asset.category}</strong></p>
                  <p className="text-slate-600">Region: <strong>{asset.region}</strong></p>
                  <p className="text-slate-600">Hazard Distance: <strong className="text-orange-700">{asset.distanceToHazardKm} km</strong></p>
                  <div className="mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
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
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center transition-colors shadow-sm"
              title={isPlaying ? "Pause Timeline" : "Play Timeline"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => { setIsPlaying(false); setCurrentFrameIndex(0); }}
              className="p-2 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="ml-2">
              <span className="font-bold text-xs text-slate-900">24-Hour Atmospheric Trajectory</span>
              <p className="text-[11px] text-blue-700 font-mono font-medium">{activeFrame.label}</p>
            </div>
          </div>

          {/* Range Slider */}
          <div className="flex-1 max-w-xl mx-2">
            <input
              type="range"
              min="0"
              max={Math.max(0, timelineFrames.length - 1)}
              value={currentFrameIndex}
              onChange={(e) => setCurrentFrameIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
          </div>

          <div className="text-right font-mono text-xs">
            <p className="text-slate-700">Column IWV: <strong className="text-blue-900">{activeFrame.metrics?.IWV_mm} mm</strong></p>
            <p className="text-slate-500">Convective Risk: <strong className="text-red-700">{activeFrame.maxRiskScore}%</strong></p>
          </div>

        </div>
      </div>

    </div>
  );
};
