import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, ShieldAlert, Layers, Waves, Navigation, Building2, Home, MapPin, Filter } from 'lucide-react';
import { fetchMapRiskZones, fetchAssets, fetchSatelliteTimeline } from '../../services/api';

// Official Survey of India post-2019 administrative datasets
import indiaStatesGeoJson from '../../data/india_states_soi.json';
import indiaNationalBorderGeoJson from '../../data/india_national_border_soi.json';

// Weather Nowcasting Hydrology, Infrastructure & Settlement Datasets
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

// Custom Marker Icons for Infrastructure Assets
const createAssetIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 1px 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Custom Icons for Settlements (Cities, Towns, Villages)
const createSettlementIcon = (item) => {
  const isCity = item.type === 'CITY';
  const isTown = item.type === 'TOWN';

  if (isCity) {
    return L.divIcon({
      className: 'custom-settlement-city',
      html: `
        <div style="transform: translate(-50%, -50%);" class="flex items-center space-x-1 cursor-pointer pointer-events-auto transition-transform hover:scale-110">
          <div class="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center ring-1 ring-blue-400">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
          <span class="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-tight whitespace-nowrap bg-slate-900/90 text-white border border-slate-700/80 shadow-xs backdrop-blur-xs">
            ${item.name}
          </span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  }

  if (isTown) {
    return L.divIcon({
      className: 'custom-settlement-town',
      html: `
        <div style="transform: translate(-50%, -50%);" class="flex items-center justify-center w-2.5 h-2.5 rounded-full bg-amber-400 border border-white shadow-sm ring-1 ring-amber-500/70 cursor-pointer pointer-events-auto transition-transform hover:scale-125">
          <div class="w-0.5 h-0.5 rounded-full bg-slate-900"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  }

  // Village (High-risk Himalayan/Basin Outpost)
  return L.divIcon({
    className: 'custom-settlement-village',
    html: `
      <div style="transform: translate(-50%, -50%);" class="flex items-center justify-center w-2 h-2 rounded-full bg-red-500 border border-white shadow-xs ring-1 ring-red-400/60 cursor-pointer pointer-events-auto transition-transform hover:scale-125"></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Custom Icons for Reservoirs & Lakes
const createWaterbodyIcon = (item) => {
  return L.divIcon({
    className: 'custom-waterbody-marker',
    html: `
      <div style="transform: translate(-50%, -50%);" class="flex items-center justify-center w-3 h-3 rounded-full bg-sky-400 border-2 border-white shadow-md ring-1 ring-sky-300 cursor-pointer pointer-events-auto transition-transform hover:scale-125">
        <div class="w-1 h-1 rounded-full bg-sky-900"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Pulsing Radar Epicenter Marker for Active Satellite Hotspots
const createEpicenterIcon = (severity) => {
  const color = severity === 'CRITICAL' ? '#ef4444' : severity === 'WARNING' ? '#f97316' : '#eab308';
  return L.divIcon({
    className: 'custom-radar-epicenter',
    html: `
      <div style="position: relative; width: 32px; height: 32px; transform: translate(-16px, -16px);">
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
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

  // Layer Toggles
  const [showPolitical, setShowPolitical] = useState(true);
  const [showWaterbodies, setShowWaterbodies] = useState(true);
  const [showTransport, setShowTransport] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [settlementFilter, setSettlementFilter] = useState('ALL'); // 'ALL' | 'CITY' | 'TOWN' | 'VILLAGE'
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

  // State Polygon Styles matching Official Survey of India Color Palette
  const getStateStyle = (feature) => {
    const name = feature.properties?.st_nm || '';

    // Unified Ladakh (Yellow/Amber - Survey of India reference standard)
    if (name === 'Ladakh') {
      return {
        fillColor: '#fde047',
        weight: 2,
        opacity: 0.95,
        color: '#ca8a04',
        fillOpacity: 0.22
      };
    }

    // Unified Jammu & Kashmir (Purple/Lavender - Survey of India reference standard)
    if (name === 'Jammu and Kashmir') {
      return {
        fillColor: '#c084fc',
        weight: 2,
        opacity: 0.95,
        color: '#9333ea',
        fillOpacity: 0.25
      };
    }

    // Himachal Pradesh (Peach/Amber)
    if (name === 'Himachal Pradesh') {
      return {
        fillColor: '#fed7aa',
        weight: 1.6,
        opacity: 0.9,
        color: '#ea580c',
        fillOpacity: 0.22
      };
    }

    // Uttarakhand (Soft Emerald)
    if (name === 'Uttarakhand') {
      return {
        fillColor: '#a7f3d0',
        weight: 1.6,
        opacity: 0.9,
        color: '#059669',
        fillOpacity: 0.22
      };
    }

    // Punjab (Rose/Pink)
    if (name === 'Punjab') {
      return {
        fillColor: '#fbcfe8',
        weight: 1.5,
        opacity: 0.85,
        color: '#db2777',
        fillOpacity: 0.20
      };
    }

    // Haryana & Delhi (Slate/Cyan)
    if (name === 'Haryana' || name === 'Delhi') {
      return {
        fillColor: '#cbd5e1',
        weight: 1.5,
        opacity: 0.85,
        color: '#475569',
        fillOpacity: 0.20
      };
    }

    // Rajasthan (Warm Sand)
    if (name === 'Rajasthan') {
      return {
        fillColor: '#fef08a',
        weight: 1.5,
        opacity: 0.85,
        color: '#d97706',
        fillOpacity: 0.20
      };
    }

    // Uttar Pradesh (Amber/Coral)
    if (name === 'Uttar Pradesh') {
      return {
        fillColor: '#ffedd5',
        weight: 1.5,
        opacity: 0.85,
        color: '#ea580c',
        fillOpacity: 0.20
      };
    }

    // Default for all other Indian States & UTs
    return {
      fillColor: '#93c5fd',
      weight: 1.3,
      opacity: 0.8,
      color: '#2563eb',
      fillOpacity: 0.18
    };
  };

  const onEachState = (feature, layer) => {
    const name = feature.properties?.st_nm || 'Indian State';
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2.8,
          fillOpacity: 0.40
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
        <p class="text-[10px] text-slate-500 mt-0.5">Sovereign State/UT of India</p>
      </div>
    `, { sticky: true, className: 'state-boundary-tooltip' });
  };

  // Filter settlements according to selection
  const filteredSettlements = SETTLEMENTS.filter((s) => {
    if (settlementFilter === 'ALL') return true;
    return s.type === settlementFilter;
  });

  // Separate river line networks and reservoir point features
  const riverNetworks = WATERBODIES.filter((w) => w.type === 'RIVER' && w.coordinates);
  const reservoirPoints = WATERBODIES.filter((w) => (w.type === 'RESERVOIR' || w.type === 'LAKE') && w.lat);

  return (
    <div className="space-y-4">
      
      {/* Top Map Header & Controls */}
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
              INSAT-3D Soundings • Political Boundaries • Hydrology, Transport & Settlements Base
            </p>
          </div>
        </div>

        {/* Layer Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Political Boundaries Toggle */}
          <button
            onClick={() => setShowPolitical(!showPolitical)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              showPolitical
                ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Official Survey of India State Boundaries"
          >
            <Layers className="w-3.5 h-3.5 text-blue-700" />
            <span>State Boundaries</span>
          </button>

          {/* Waterbodies & River Networks Toggle */}
          <button
            onClick={() => setShowWaterbodies(!showWaterbodies)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              showWaterbodies
                ? 'bg-sky-50 text-sky-900 border-sky-300 font-semibold shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Rivers, Drainage Channels & Reservoirs"
          >
            <Waves className="w-3.5 h-3.5 text-sky-600" />
            <span>Waterbodies & Rivers ({WATERBODIES.length})</span>
          </button>

          {/* Transport Corridors Toggle */}
          <button
            onClick={() => setShowTransport(!showTransport)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              showTransport
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle National Highways & Evacuation Rail Corridors"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-600" />
            <span>Highways & Transport</span>
          </button>

          {/* Settlements (Cities, Towns, Villages) Toggle */}
          <div className="inline-flex items-center rounded border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              onClick={() => setShowSettlements(!showSettlements)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
                showSettlements ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Settlements ({filteredSettlements.length})</span>
            </button>

            {showSettlements && (
              <div className="flex items-center space-x-1 border-l border-slate-200 pl-1 ml-1 text-[11px]">
                <button
                  onClick={() => setSettlementFilter('ALL')}
                  className={`px-1.5 py-0.5 rounded ${settlementFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSettlementFilter('CITY')}
                  className={`px-1.5 py-0.5 rounded ${settlementFilter === 'CITY' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cities
                </button>
                <button
                  onClick={() => setSettlementFilter('TOWN')}
                  className={`px-1.5 py-0.5 rounded ${settlementFilter === 'TOWN' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Towns
                </button>
                <button
                  onClick={() => setSettlementFilter('VILLAGE')}
                  className={`px-1.5 py-0.5 rounded ${settlementFilter === 'VILLAGE' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Villages
                </button>
              </div>
            )}
          </div>

          {/* Hazard Polygons Toggle */}
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
              showPolygons
                ? 'bg-red-50 text-red-800 border-red-200 font-semibold shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hazard Polygons ({riskZones.length})
          </button>

          {/* Monitored Assets Toggle */}
          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
              showAssets
                ? 'bg-slate-100 text-slate-800 border-slate-300 font-semibold shadow-xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Critical Assets ({assets.length})
          </button>

        </div>

      </div>

      {/* Leaflet Map Container */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm relative bg-slate-950">
        <MapContainer
          center={[26.5, 79.5]}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '640px' }}
        >
          <MapResizeHandler />

          {/* Base Layer: High-Resolution Satellite Imagery (Pure Earth Topography) */}
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />

          {/* Modes of Transport: Real-Time Roads, Highways & Street Networks Overlay */}
          {showTransport && (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: USGS, Esri, DeLorme'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              opacity={0.65}
            />
          )}

          {/* Official Survey of India State & UT Political Boundaries Overlay */}
          {showPolitical && (
            <GeoJSON
              key="soi-states-layer"
              data={indiaStatesGeoJson}
              style={getStateStyle}
              onEachFeature={onEachState}
            />
          )}

          {/* Survey of India Bold National Boundary Outline of the Republic of India */}
          {showPolitical && (
            <GeoJSON
              key="soi-national-boundary"
              data={indiaNationalBorderGeoJson}
              style={{
                color: '#0f172a',
                weight: 2.8,
                opacity: 0.95,
                fillOpacity: 0
              }}
              interactive={false}
            />
          )}

          {/* Strategic Lifeline Highways & Evacuation Transit Corridors */}
          {showTransport && TRANSPORT_CORRIDORS.map((corridor) => (
            <Polyline
              key={corridor.id}
              positions={corridor.coordinates}
              pathOptions={{
                color: corridor.color || '#f97316',
                weight: corridor.type === 'RAILWAY' ? 2.5 : 3.5,
                dashArray: corridor.type === 'RAILWAY' ? '6, 6' : undefined,
                opacity: 0.95
              }}
            >
              <Tooltip sticky>
                <div className="p-1 font-sans text-xs">
                  <span className="font-bold text-slate-900">{corridor.name}</span>
                  <p className="text-[10px] text-amber-700 font-semibold">{corridor.category}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Status: <strong>{corridor.status}</strong></p>
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{corridor.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                      {corridor.type}
                    </span>
                  </div>
                  <p className="text-slate-600">{corridor.description}</p>
                  <div className="pt-1 mt-1 border-t flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Weather Risk:</span>
                    <strong className="text-red-700">{corridor.status}</strong>
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Waterbodies: Major River Systems & Inundation Drainage Channels */}
          {showWaterbodies && riverNetworks.map((river) => (
            <Polyline
              key={river.id}
              positions={river.coordinates}
              pathOptions={{
                color: '#0ea5e9',
                weight: 4,
                opacity: 0.9
              }}
            >
              <Tooltip sticky>
                <div className="p-1 font-sans text-xs">
                  <div className="flex items-center space-x-1 text-sky-900 font-bold">
                    <span>🌊 {river.name}</span>
                  </div>
                  <p className="text-[10px] text-sky-700">{river.basin}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Flow: <strong className="text-sky-900">{river.flowRate}</strong></p>
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h4 className="font-bold text-sky-950 text-sm flex items-center space-x-1">
                      <span>🌊 {river.name}</span>
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800">
                      {river.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{river.description}</p>
                  <div className="pt-1 mt-1 border-t space-y-0.5 text-[11px]">
                    <p className="text-slate-600">Discharge / Flow: <strong className="text-sky-900">{river.flowRate}</strong></p>
                    <p className="text-slate-600">Nowcasting Context: <strong className="text-red-700">{river.riskZoneRef}</strong></p>
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Waterbodies: Major Reservoirs & Natural Lakes */}
          {showWaterbodies && reservoirPoints.map((lake) => (
            <Marker
              key={lake.id}
              position={[lake.lat, lake.lon]}
              icon={createWaterbodyIcon(lake)}
            >
              <Tooltip sticky>
                <div className="font-inter text-xs">
                  <span className="font-bold text-sky-950">{lake.name}</span>
                  <span className="text-[10px] text-slate-500 ml-1">({lake.type})</span>
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h4 className="font-bold text-sky-950 text-sm">{lake.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800 uppercase">
                      {lake.type}
                    </span>
                  </div>
                  <p className="text-slate-600">{lake.description}</p>
                  <div className="pt-1 mt-1 border-t space-y-0.5 text-[11px]">
                    <p className="text-slate-600">Basin: <strong className="text-slate-900">{lake.basin}</strong></p>
                    {lake.storageMcm && <p className="text-slate-600">Gross Storage: <strong className="text-sky-900">{lake.storageMcm} MCM</strong></p>}
                    <p className="text-slate-600">Flood Cushion Status: <strong className="text-emerald-700">{lake.status}</strong></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Settlements: Cities, Towns, and Vulnerable Villages */}
          {showSettlements && filteredSettlements.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lon]}
              icon={createSettlementIcon(item)}
            >
              <Tooltip sticky>
                <div className="font-inter text-xs space-y-0.5">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">({item.type})</span>
                  </div>
                  {item.elevation_m && (
                    <div className="text-[10px] text-indigo-700 font-medium">
                      {item.elevation_m}m ASL • {item.vulnerability}
                    </div>
                  )}
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 font-inter text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <div className="flex items-center space-x-1">
                      {item.type === 'CITY' ? <Building2 className="w-3.5 h-3.5 text-blue-600" /> : <Home className="w-3.5 h-3.5 text-amber-600" />}
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.type === 'CITY' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'TOWN' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    Location: <strong className="text-slate-900">{item.district ? `${item.district}, ` : ''}{item.state}</strong>
                  </p>
                  
                  {item.elevation_m && (
                    <p className="text-slate-600">
                      Altitude: <strong className="text-indigo-800 font-mono">{item.elevation_m} meters ASL</strong>
                    </p>
                  )}

                  <p className="text-slate-600">
                    Population: <strong className="text-slate-800">{item.population}</strong>
                  </p>

                  <div className="pt-1.5 mt-1 border-t space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vulnerability:</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.vulnerability}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nowcasting Alert:</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        {item.nowcastingStatus}
                      </span>
                    </div>
                  </div>

                </div>
              </Popup>
            </Marker>
          ))}

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
