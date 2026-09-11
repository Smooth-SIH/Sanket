import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Polygon, Marker, Popup, GeoJSON, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Layers, 
  Building2, 
  Home, 
  Navigation, 
  Waves, 
  MapPin, 
  Radio,
  Info
} from 'lucide-react';
import { fetchMapRiskZones, fetchAssets, fetchSatelliteTimeline } from '../../services/api';

// Official Survey of India post-2019 administrative datasets
import indiaStatesGeoJson from '../../data/india_states_soi.json';
import indiaNationalBorderGeoJson from '../../data/india_national_border_soi.json';

// Weather Nowcasting Hydrology, Infrastructure & Settlement Reference Datasets
import { WATERBODIES } from '../../data/waterbodies';
import { SETTLEMENTS } from '../../data/settlements';
import { TRANSPORT_CORRIDORS } from '../../data/transportCorridors';

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

// Geodesic distance calculation in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find closest tactical feature (settlement, river, lake/reservoir, or transport corridor) to click location
function findClosestTacticalFeature(clickLat, clickLng) {
  let closest = null;
  let minDistance = 45; // 45 km click radius tolerance

  // 1. Check Settlements (Cities, Towns, High-Risk Villages)
  for (const s of SETTLEMENTS) {
    const dist = getDistanceKm(clickLat, clickLng, s.lat, s.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = {
        kind: 'SETTLEMENT',
        data: s,
        position: [s.lat, s.lon],
        distance: dist
      };
    }
  }

  // 2. Check Waterbodies (Lakes, Reservoirs, Rivers)
  for (const w of WATERBODIES) {
    if (w.lat && w.lon) {
      const dist = getDistanceKm(clickLat, clickLng, w.lat, w.lon);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          kind: 'WATERBODY',
          data: w,
          position: [w.lat, w.lon],
          distance: dist
        };
      }
    } else if (w.coordinates) {
      for (const pt of w.coordinates) {
        const dist = getDistanceKm(clickLat, clickLng, pt[0], pt[1]);
        if (dist < minDistance) {
          minDistance = dist;
          closest = {
            kind: 'RIVER',
            data: w,
            position: [pt[0], pt[1]],
            distance: dist
          };
        }
      }
    }
  }

  // 3. Check Transport Corridors (Highways, Rail Lines)
  for (const t of TRANSPORT_CORRIDORS) {
    if (t.coordinates) {
      for (const pt of t.coordinates) {
        const dist = getDistanceKm(clickLat, clickLng, pt[0], pt[1]);
        if (dist < minDistance) {
          minDistance = dist;
          closest = {
            kind: 'TRANSPORT',
            data: t,
            position: [pt[0], pt[1]],
            distance: dist
          };
        }
      }
    }
  }

  return closest;
}

// Click listener inside map container
const MapClickInspector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const match = findClosestTacticalFeature(lat, lng);
      if (match) {
        onSelect(match);
      }
    }
  });
  return null;
};

// Custom Marker Icons for Monitored Infrastructure Assets
const createAssetIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 1px 5px rgba(0,0,0,0.6);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Pulsing Radar Epicenter Marker for Active Satellite Hotspots
const createEpicenterIcon = (severity) => {
  const color = severity === 'CRITICAL' ? '#ef4444' : severity === 'WARNING' ? '#f97316' : '#eab308';
  return L.divIcon({
    className: 'custom-radar-epicenter',
    html: `
      <div style="position: relative; width: 32px; height: 32px; transform: translate(-16px, -16px);">
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: ${color}; opacity: 0.4; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; top: 8px; left: 8px; width: 16px; height: 16px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export const MapView = () => {
  const latestScan = useSelector((state) => state.satellite.latestScan);
  const [riskZones, setRiskZones] = useState([]);
  const [assets, setAssets] = useState([]);
  const [timelineFrames, setTimelineFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Layer Toggles (State Boundaries is permanent and cannot be turned off)
  const [showPolygons, setShowPolygons] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [selectedTacticalFeature, setSelectedTacticalFeature] = useState(null);

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
  }, [latestScan]);

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

  // State Boundary Style over Tactical Satellite Imagery
  const getStateStyle = (feature) => {
    const name = feature.properties?.st_nm || '';

    // Subtle tint highlights for key monitored regions while keeping satellite imagery crystal clear
    if (name === 'Ladakh' || name === 'Jammu and Kashmir') {
      return {
        fillColor: '#38bdf8',
        weight: 1.6,
        opacity: 0.9,
        color: '#38bdf8',
        fillOpacity: 0.05
      };
    }
    if (name === 'Uttarakhand' || name === 'Himachal Pradesh') {
      return {
        fillColor: '#34d399',
        weight: 1.6,
        opacity: 0.9,
        color: '#34d399',
        fillOpacity: 0.06
      };
    }
    if (name === 'Sikkim' || name === 'Assam' || name === 'Kerala') {
      return {
        fillColor: '#f59e0b',
        weight: 1.6,
        opacity: 0.9,
        color: '#f59e0b',
        fillOpacity: 0.06
      };
    }

    return {
      fillColor: '#38bdf8',
      weight: 1.3,
      opacity: 0.8,
      color: '#38bdf8',
      fillOpacity: 0.03
    };
  };

  const onEachState = (feature, layer) => {
    const name = feature.properties?.st_nm || 'Indian State';
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2.4,
          color: '#ffffff',
          fillOpacity: 0.15
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(getStateStyle(feature));
      }
    });

    layer.bindTooltip(`
      <div class="px-2 py-1 font-sans text-xs">
        <div class="font-bold text-slate-900 flex items-center space-x-1">
          <span>${name}</span>
          <span class="text-[10px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold uppercase">India</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-0.5">Survey of India Demarcation</p>
      </div>
    `, { sticky: true, className: 'state-boundary-tooltip' });
  };

  return (
    <div className="space-y-4">
      
      {/* Tactical Map Header & Controls */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200/60 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-slate-900">National Geospatial Hazard & Radar Console</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                🇮🇳 Survey of India Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Tactical Satellite Cartography • Real-Time Hydrology, Transport & Settlements
            </p>
          </div>
        </div>

        {/* Clean Controls (State Boundaries Permanently Locked, Overlays integrated in satellite map) */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Permanent State Boundaries Badge */}
          <div 
            className="px-3 py-1.5 rounded text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-300 flex items-center space-x-1.5 shadow-xs"
            title="Official Survey of India State Boundaries are permanently active"
          >
            <Layers className="w-3.5 h-3.5 text-sky-700" />
            <span>State Boundaries (Locked)</span>
          </div>

          {/* Hazard Polygons Toggle */}
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
              showPolygons
                ? 'bg-red-50 text-red-800 border-red-300 shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hazard Polygons ({riskZones.length})
          </button>

          {/* Monitored Assets Toggle */}
          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
              showAssets
                ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Critical Assets ({assets.length})
          </button>

          {/* Tactical Hint */}
          <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Click any city, river, or highway to inspect telemetry</span>
          </div>

        </div>

      </div>

      {/* Leaflet Map Container with Tactical Satellite Base */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm relative bg-slate-950">
        <MapContainer
          center={[26.5, 79.5]}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '650px' }}
        >
          <MapResizeHandler />
          <MapClickInspector onSelect={setSelectedTacticalFeature} />

          {/* Tactical Satellite Base Layer: High-Resolution Imagery with Integrated Cartography (Settlements, Waterbodies, Roads, Railways) */}
          <TileLayer
            attribution='&copy; Google Satellite Maps &bull; Tactical Cartography'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />

          {/* Official Survey of India State & UT Political Boundaries Overlay (Permanently Active) */}
          <GeoJSON
            key="soi-states-layer"
            data={indiaStatesGeoJson}
            style={getStateStyle}
            onEachFeature={onEachState}
          />

          {/* Survey of India Bold National Boundary Outline */}
          <GeoJSON
            key="soi-national-boundary"
            data={indiaNationalBorderGeoJson}
            style={{
              color: '#38bdf8',
              weight: 2.2,
              opacity: 0.95,
              fillOpacity: 0
            }}
            interactive={false}
          />

          {/* Interactive Feature Inspection Popup (Settlement, River, Lake, or Highway) */}
          {selectedTacticalFeature && (
            <Popup
              position={selectedTacticalFeature.position}
              onClose={() => setSelectedTacticalFeature(null)}
            >
              {selectedTacticalFeature.kind === 'SETTLEMENT' && (
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <div className="flex items-center space-x-1">
                      {selectedTacticalFeature.data.type === 'CITY' ? (
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Home className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <h4 className="font-bold text-slate-900 text-sm">{selectedTacticalFeature.data.name}</h4>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      selectedTacticalFeature.data.type === 'CITY' ? 'bg-blue-100 text-blue-800' :
                      selectedTacticalFeature.data.type === 'TOWN' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTacticalFeature.data.type}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    Location: <strong className="text-slate-900">{selectedTacticalFeature.data.district ? `${selectedTacticalFeature.data.district}, ` : ''}{selectedTacticalFeature.data.state}</strong>
                  </p>
                  
                  {selectedTacticalFeature.data.elevation_m && (
                    <p className="text-slate-600">
                      Altitude: <strong className="text-indigo-800 font-mono">{selectedTacticalFeature.data.elevation_m} meters ASL</strong>
                    </p>
                  )}

                  <p className="text-slate-600">
                    Population: <strong className="text-slate-800">{selectedTacticalFeature.data.population}</strong>
                  </p>

                  <div className="pt-1.5 mt-1 border-t space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vulnerability:</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {selectedTacticalFeature.data.vulnerability}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nowcasting Alert:</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        {selectedTacticalFeature.data.nowcastingStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(selectedTacticalFeature.kind === 'RIVER' || selectedTacticalFeature.kind === 'WATERBODY') && (
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h4 className="font-bold text-sky-950 text-sm flex items-center space-x-1">
                      <span>🌊 {selectedTacticalFeature.data.name}</span>
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800 uppercase">
                      {selectedTacticalFeature.data.type}
                    </span>
                  </div>
                  <p className="text-slate-600">{selectedTacticalFeature.data.description}</p>
                  <div className="pt-1 mt-1 border-t space-y-0.5 text-[11px]">
                    <p className="text-slate-600">Basin: <strong className="text-slate-900">{selectedTacticalFeature.data.basin}</strong></p>
                    {selectedTacticalFeature.data.flowRate && (
                      <p className="text-slate-600">Discharge / Flow: <strong className="text-sky-900">{selectedTacticalFeature.data.flowRate}</strong></p>
                    )}
                    {selectedTacticalFeature.data.storageMcm && (
                      <p className="text-slate-600">Gross Storage: <strong className="text-sky-900">{selectedTacticalFeature.data.storageMcm} MCM</strong></p>
                    )}
                    <p className="text-slate-600">Status: <strong className="text-emerald-700">{selectedTacticalFeature.data.status}</strong></p>
                    {selectedTacticalFeature.data.riskZoneRef && (
                      <p className="text-slate-600">Nowcasting Context: <strong className="text-red-700">{selectedTacticalFeature.data.riskZoneRef}</strong></p>
                    )}
                  </div>
                </div>
              )}

              {selectedTacticalFeature.kind === 'TRANSPORT' && (
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedTacticalFeature.data.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                      {selectedTacticalFeature.data.type}
                    </span>
                  </div>
                  <p className="text-slate-600">{selectedTacticalFeature.data.description}</p>
                  <div className="pt-1 mt-1 border-t flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Weather Risk:</span>
                    <strong className="text-red-700">{selectedTacticalFeature.data.status}</strong>
                  </div>
                </div>
              )}
            </Popup>
          )}

          {/* Live Hazard Polygons & Satellite Radar Epicenters */}
          {showPolygons && riskZones.map((feature) => {
            const coords = feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
            const severity = feature.properties.severity || 'WARNING';
            const isRed = severity === 'CRITICAL';
            const color = isRed ? '#dc2626' : (severity === 'WARNING' ? '#ea580c' : '#eab308');
            const center = feature.properties.center ? [feature.properties.center[1], feature.properties.center[0]] : coords[0];

            return (
              <React.Fragment key={feature.properties.id}>
                <Polygon
                  positions={coords}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.35,
                    weight: 2.5
                  }}
                >
                  <Popup>
                    <div className="p-1 font-inter text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{feature.properties.name}</h4>
                      <p className="text-slate-600">Hazard: <strong className="text-slate-900">{feature.properties.hazard}</strong></p>
                      <p className="text-slate-600">Column Vapor (IWV): <strong>{feature.properties.iwv} mm</strong></p>
                      <p className="text-slate-600">Cloud Top Temp (CTT): <strong>{feature.properties.ctt} K</strong></p>
                      {feature.properties.cape && <p className="text-slate-600">Convective Energy: <strong>{feature.properties.cape} J/kg</strong></p>}
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${isRed ? 'bg-red-600' : 'bg-orange-600'}`}>
                        {severity} SATELLITE CELL
                      </span>
                    </div>
                  </Popup>
                </Polygon>

                {/* Pulsing Convective Epicenter Marker */}
                {center && (
                  <Marker
                    position={center}
                    icon={createEpicenterIcon(severity)}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="font-sans text-[11px] p-0.5">
                        <span className="font-bold text-slate-900">{feature.properties.region || feature.properties.name}</span>
                        <div className="text-slate-500 font-mono text-[10px]">
                          IWV: {feature.properties.iwv}mm • CTT: {feature.properties.ctt}K
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}

          {/* Infrastructure Asset Markers */}
          {showAssets && assets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.lat, asset.lon]}
              icon={createAssetIcon(
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
