import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Navigation, 
  Search, 
  Eye, 
  Compass, 
  Flag, 
  X,
  Info,
  Radio
} from 'lucide-react';
import { fetchMapRiskZones, fetchAssets, fetchSatelliteTimeline } from '../../services/api';

// Complete List of All 28 States & 8 UTs with Center Coordinates and Capitals
const INDIA_REGIONS = [
  { name: 'Uttarakhand', type: 'STATE', capital: 'Dehradun', lat: 30.0668, lon: 79.0193, riskScore: 96, hazard: 'Cloudburst', severity: 'CRITICAL' },
  { name: 'Sikkim', type: 'STATE', capital: 'Gangtok', lat: 27.5330, lon: 88.5122, riskScore: 91, hazard: 'Flash Flood', severity: 'CRITICAL' },
  { name: 'Himachal Pradesh', type: 'STATE', capital: 'Shimla', lat: 31.1048, lon: 77.1734, riskScore: 78, hazard: 'Hailstorm', severity: 'WARNING' },
  { name: 'Jammu & Kashmir', type: 'UT', capital: 'Srinagar & Jammu', lat: 33.7782, lon: 76.5762, riskScore: 74, hazard: 'Severe Thunderstorm', severity: 'WARNING' },
  { name: 'Ladakh', type: 'UT', capital: 'Leh', lat: 34.1526, lon: 77.5771, riskScore: 58, hazard: 'Flash Outflow', severity: 'WATCH' },
  { name: 'Assam', type: 'STATE', capital: 'Dispur', lat: 26.2006, lon: 92.9376, riskScore: 92, hazard: 'Flash Flood', severity: 'CRITICAL' },
  { name: 'Kerala', type: 'STATE', capital: 'Thiruvananthapuram', lat: 10.8505, lon: 76.2711, riskScore: 82, hazard: 'Monsoon Squall', severity: 'WARNING' },
  { name: 'Odisha', type: 'STATE', capital: 'Bhubaneswar', lat: 20.9517, lon: 85.0985, riskScore: 84, hazard: 'Cyclone', severity: 'WARNING' },
  { name: 'Maharashtra', type: 'STATE', capital: 'Mumbai', lat: 19.7515, lon: 75.7139, riskScore: 62, hazard: 'Severe Thunderstorm', severity: 'WATCH' },
  { name: 'Delhi', type: 'UT', capital: 'New Delhi', lat: 28.6139, lon: 77.2090, isCountryCapital: true, riskScore: 45, hazard: 'Heat & Convection', severity: 'WATCH' },
  { name: 'Punjab', type: 'STATE', capital: 'Chandigarh', lat: 31.1471, lon: 75.3412, riskScore: 38, hazard: 'Moderate Rain', severity: 'SAFE' },
  { name: 'Haryana', type: 'STATE', capital: 'Chandigarh', lat: 29.0588, lon: 76.0856, riskScore: 35, hazard: 'Moderate Rain', severity: 'SAFE' },
  { name: 'Rajasthan', type: 'STATE', capital: 'Jaipur', lat: 27.0238, lon: 74.2179, riskScore: 42, hazard: 'Convective Wind', severity: 'SAFE' },
  { name: 'Uttar Pradesh', type: 'STATE', capital: 'Lucknow', lat: 26.8467, lon: 80.9462, riskScore: 55, hazard: 'Heavy Rain', severity: 'WATCH' },
  { name: 'Bihar', type: 'STATE', capital: 'Patna', lat: 25.0961, lon: 85.3131, riskScore: 68, hazard: 'Riverine Flood', severity: 'WARNING' },
  { name: 'West Bengal', type: 'STATE', capital: 'Kolkata', lat: 22.9868, lon: 87.8550, riskScore: 79, hazard: 'Coastal Surge', severity: 'WARNING' },
  { name: 'Jharkhand', type: 'STATE', capital: 'Ranchi', lat: 23.6102, lon: 85.2799, riskScore: 48, hazard: 'Thunderstorm', severity: 'WATCH' },
  { name: 'Chhattisgarh', type: 'STATE', capital: 'Raipur', lat: 21.2787, lon: 81.8661, riskScore: 46, hazard: 'Thunderstorm', severity: 'WATCH' },
  { name: 'Madhya Pradesh', type: 'STATE', capital: 'Bhopal', lat: 22.9734, lon: 78.6569, riskScore: 40, hazard: 'Normal', severity: 'SAFE' },
  { name: 'Gujarat', type: 'STATE', capital: 'Gandhinagar', lat: 22.2587, lon: 71.1924, riskScore: 52, hazard: 'Coastal Wind', severity: 'WATCH' },
  { name: 'Goa', type: 'STATE', capital: 'Panaji', lat: 15.2993, lon: 74.1240, riskScore: 50, hazard: 'Monsoon Rain', severity: 'WATCH' },
  { name: 'Karnataka', type: 'STATE', capital: 'Bengaluru', lat: 15.3173, lon: 75.7139, riskScore: 48, hazard: 'Thunderstorm', severity: 'WATCH' },
  { name: 'Telangana', type: 'STATE', capital: 'Hyderabad', lat: 18.1124, lon: 79.0193, riskScore: 44, hazard: 'Moderate Rain', severity: 'SAFE' },
  { name: 'Andhra Pradesh', type: 'STATE', capital: 'Amaravati', lat: 15.9129, lon: 79.7400, riskScore: 71, hazard: 'Coastal Squall', severity: 'WARNING' },
  { name: 'Tamil Nadu', type: 'STATE', capital: 'Chennai', lat: 11.1271, lon: 78.6569, riskScore: 56, hazard: 'Monsoon Downpour', severity: 'WATCH' },
  { name: 'Arunachal Pradesh', type: 'STATE', capital: 'Itanagar', lat: 28.2180, lon: 94.7278, riskScore: 81, hazard: 'Landslide', severity: 'WARNING' },
  { name: 'Nagaland', type: 'STATE', capital: 'Kohima', lat: 26.1584, lon: 94.5624, riskScore: 73, hazard: 'Landslide', severity: 'WARNING' },
  { name: 'Manipur', type: 'STATE', capital: 'Imphal', lat: 24.6637, lon: 93.9063, riskScore: 69, hazard: 'Flash Flood', severity: 'WARNING' },
  { name: 'Mizoram', type: 'STATE', capital: 'Aizawl', lat: 23.1645, lon: 92.9376, riskScore: 66, hazard: 'Landslide', severity: 'WARNING' },
  { name: 'Tripura', type: 'STATE', capital: 'Agartala', lat: 23.9408, lon: 91.9882, riskScore: 70, hazard: 'Flash Flood', severity: 'WARNING' },
  { name: 'Meghalaya', type: 'STATE', capital: 'Shillong', lat: 25.4670, lon: 91.3662, riskScore: 88, hazard: 'Heavy Rain', severity: 'CRITICAL' },
  { name: 'Chandigarh', type: 'UT', capital: 'Chandigarh', lat: 30.7333, lon: 76.7794, riskScore: 36, hazard: 'Normal', severity: 'SAFE' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'UT', capital: 'Daman', lat: 20.4283, lon: 72.8397, riskScore: 42, hazard: 'Coastal Wind', severity: 'SAFE' },
  { name: 'Puducherry', type: 'UT', capital: 'Puducherry', lat: 11.9416, lon: 79.8083, riskScore: 54, hazard: 'Coastal Rain', severity: 'WATCH' },
  { name: 'Lakshadweep', type: 'UT', capital: 'Kavaratti', lat: 10.5669, lon: 72.6420, riskScore: 49, hazard: 'High Waves', severity: 'WATCH' },
  { name: 'Andaman & Nicobar Islands', type: 'UT', capital: 'Port Blair', lat: 11.6233, lon: 92.7265, riskScore: 65, hazard: 'Tropical Squall', severity: 'WARNING' }
];

const MapFocusHandler = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const createCapitalIcon = (isCountryCapital = false) => {
  return L.divIcon({
    className: 'custom-capital-marker',
    html: isCountryCapital ? `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 4px; border: 2.5px solid #ffffff; box-shadow: 0 0 16px #ef4444; display: flex; align-items: center; justify-content: center;">
          <div style="width: 7px; height: 7px; background-color: #ffffff; border-radius: 1px;"></div>
        </div>
      </div>
    ` : `
      <div style="background-color: #000000; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #00d4ff; box-shadow: 0 0 10px #00d4ff;"></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createAssetIcon = (status) => {
  const color = status === 'EVACUATION_REQUIRED' ? '#ef4444' :
                status === 'HIGH_DANGER' ? '#ff6b35' :
                status === 'MODERATE' ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #050c17; box-shadow: 0 0 10px ${color};"></div>`,
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
  
  const [showPolygons, setShowPolygons] = useState(true);
  const [showCapitals, setShowCapitals] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);

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
      } catch (err) {
        console.error('Failed to load map data:', err);
      }
    };
    loadData();
  }, []);

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
    setMapCenter([region.lat, region.lon]);
    setMapZoom(7);
  };

  const filteredRegions = INDIA_REGIONS.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.capital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-80px)] py-4 px-4 lg:px-8 max-w-7xl mx-auto space-y-4 font-inter text-slate-100">
      
      {/* Top Header & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-orbitron font-extrabold text-base lg:text-lg text-white">SANKET GEOSPATIAL HAZARD MAP</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">INDIA STATES & UTs</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">MOSDAC INSAT-3D 2DSphere Telemetry • Official Territorial Boundary Overlays</p>
            </div>
          </div>
        </div>

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
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((reg) => (
                    <div key={reg.name} onClick={() => { handleSelectRegion(reg); setSearchQuery(''); }} className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors">
                      <div><span className="font-bold text-white">{reg.name}</span><span className="text-[10px] text-slate-400 ml-1.5">({reg.capital})</span></div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${reg.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/40' : reg.severity === 'WARNING' ? 'bg-orange-950 text-orange-400 border border-orange-500/40' : 'bg-blue-950 text-blue-400 border border-blue-500/40'}`}>
                        {reg.riskScore}% {reg.hazard}
                      </span>
                    </div>
                  ))
                ) : <div className="p-3 text-xs text-slate-500 text-center font-mono">No state found</div>}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowPolygons(!showPolygons)} className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${showPolygons ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>Hazard Polygons ({riskZones.length})</button>
            <button onClick={() => setShowCapitals(!showCapitals)} className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${showCapitals ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>State Capitals ({INDIA_REGIONS.length})</button>
            <button onClick={() => setShowAssets(!showAssets)} className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${showAssets ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>Assets ({assets.length})</button>
            <button onClick={() => { setMapCenter([22.5937, 78.9629]); setMapZoom(5); setSelectedRegion(null); }} className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors" title="Reset Map"><Navigation className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Tactical Leaflet GIS Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
        <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-800 shadow-glass relative bg-[#050c17] min-h-[620px]">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ width: '100%', height: '620px' }}>
            <MapFocusHandler center={mapCenter} zoom={mapZoom} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles-dark" />
            
            {showPolygons && riskZones.map((feature) => {
              const coords = feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
              const isSelected = selectedRegion?.name === feature.properties.state;
              return (
                <Polygon 
                  key={feature.properties.id} 
                  positions={coords} 
                  eventHandlers={{ 
                    click: () => { 
                      const matched = INDIA_REGIONS.find(r => r.name === feature.properties.state); 
                      if (matched) handleSelectRegion(matched); 
                    } 
                  }} 
                  pathOptions={{ 
                    color: isSelected ? '#00d4ff' : (feature.properties.color || '#ef4444'), 
                    fillColor: feature.properties.color || '#ef4444', 
                    fillOpacity: isSelected ? 0.65 : 0.4, 
                    weight: isSelected ? 3.5 : 2 
                  }}
                >
                  <Popup>
                    <div className="p-2 font-inter text-xs space-y-1">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                        <span className="font-orbitron font-bold text-cyan-400 text-sm">{feature.properties.state}</span>
                        <span className="text-[10px] font-mono text-slate-400">({feature.properties.capital})</span>
                      </div>
                      <p className="text-slate-200 mt-1 font-bold">{feature.properties.name}</p>
                      <p className="text-slate-300">Hazard: <strong className="text-orange-400">{feature.properties.hazard}</strong></p>
                      <p className="text-slate-300">IWV Density: <strong className="text-cyan-300">{feature.properties.iwv} mm</strong></p>
                      <p className="text-slate-300">Cloud Top Temp: <strong className="text-sky-300">{feature.properties.ctt} K</strong></p>
                      <div className="mt-2 pt-1 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">{feature.properties.severity} HAZARD</span>
                        <span className="font-orbitron font-bold text-cyan-300 text-xs">SCORE: {feature.properties.riskScore || 90}%</span>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {showCapitals && INDIA_REGIONS.map((reg) => (
              <Marker key={reg.name} position={[reg.lat, reg.lon]} icon={createCapitalIcon(reg.isCountryCapital)} eventHandlers={{ click: () => handleSelectRegion(reg) }}>
                <Popup>
                  <div className="p-2 text-xs space-y-1 font-inter">
                    <h4 className="font-orbitron font-bold text-white text-sm">{reg.capital} {reg.isCountryCapital && '(NATIONAL CAPITAL)'}</h4>
                    <p className="text-slate-300">Territory: <strong className="text-cyan-400">{reg.name} ({reg.type})</strong></p>
                    <p className="text-slate-300">Current Hazard: <strong className="text-orange-400">{reg.hazard}</strong></p>
                    <p className="text-slate-300">MOSDAC Risk Score: <strong className="text-red-400">{reg.riskScore}%</strong></p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showAssets && assets.map((asset) => (
              <Marker key={asset.id} position={[asset.lat, asset.lon]} icon={createAssetIcon(asset.currentRiskStatus)}>
                <Popup>
                  <div className="p-2 font-inter text-xs space-y-1">
                    <h4 className="font-orbitron font-bold text-white text-sm">{asset.name}</h4>
                    <p className="text-slate-400">Category: <strong className="text-slate-200">{asset.category}</strong></p>
                    <p className="text-slate-400">Region: <strong className="text-slate-200">{asset.region}</strong></p>
                    <p className="text-slate-400">Hazard Distance: <strong className="text-orange-400">{asset.distanceToHazardKm} km</strong></p>
                    <div className="mt-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-cyan-500/30">STATUS: {asset.currentRiskStatus}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md font-mono text-[11px] space-y-2 max-w-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5"><span className="font-bold text-cyan-300 text-xs">OFFICIAL MAP LEGEND</span><span className="text-[9px] text-slate-400">Map not to Scale</span></div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 text-[10px]">
              <div className="flex items-center space-x-1.5"><span className="w-3 h-0.5 bg-indigo-400 inline-block" /><span>Intl. Boundary</span></div>
              <div className="flex items-center space-x-1.5"><span className="w-3 h-0.5 bg-purple-400 border-b border-dashed border-purple-400 inline-block" /><span>State/UT Boundary</span></div>
              <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-red-500 border border-white rounded-sm inline-block" /><span>Country Capital</span></div>
              <div className="flex items-center space-x-1.5"><span className="w-2 h-2 bg-black border border-cyan-400 rounded-full inline-block" /><span>State Capital</span></div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400"><span>MOSDAC Satellite Overlay</span><span className="text-emerald-400 font-bold">INSAT-3D 2DSphere</span></div>
          </div>
        </div>

        {/* Regional Telemetry Side Panel */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatePresence mode="wait">
            {selectedRegion ? (
              <motion.div key={selectedRegion.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-5 rounded-3xl glass-panel border border-cyan-500/30 shadow-glow-cyan space-y-4 relative">
                <button onClick={() => setSelectedRegion(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">SELECTED REGIONAL TELEMETRY</span>
                  <h3 className="font-orbitron font-extrabold text-xl text-white mt-0.5">{selectedRegion.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Capital: <strong className="text-white">{selectedRegion.capital}</strong> ({selectedRegion.type})</p>
                </div>
                <div className={`p-4 rounded-2xl border ${selectedRegion.severity === 'CRITICAL' ? 'bg-red-950/40 border-red-500/40 text-red-200' : selectedRegion.severity === 'WARNING' ? 'bg-orange-950/40 border-orange-500/40 text-orange-200' : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'}`}>
                  <div className="flex items-center justify-between text-xs font-mono mb-1"><span>HAZARD CLASSIFICATION</span><span className="font-bold">{selectedRegion.severity}</span></div>
                  <div className="flex items-baseline space-x-2"><span className="font-orbitron font-black text-4xl">{selectedRegion.riskScore}%</span><span className="text-xs font-mono text-slate-300">OVERALL RISK</span></div>
                  <p className="text-xs font-mono mt-2 pt-2 border-t border-slate-800">Primary Hazard: <strong className="text-white">{selectedRegion.hazard}</strong></p>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between"><span className="text-slate-400">Integrated Water Vapor:</span><strong className="text-cyan-300">{activeFrame.metrics?.IWV_mm || 64.2} mm</strong></div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between"><span className="text-slate-400">Cloud Top Temp (CTT):</span><strong className="text-sky-300">{activeFrame.metrics?.CTT_K || 204.1} K</strong></div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between"><span className="text-slate-400">Convective Instability:</span><strong className="text-orange-300">{activeFrame.metrics?.CAPE_Jkg || 3840} J/kg</strong></div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <p className="flex items-center space-x-1.5 text-cyan-400"><Radio className="w-3.5 h-3.5 animate-pulse" /><span>MOSDAC Satellite Telemetry Stream Active</span></p>
                  <p>Location: [{selectedRegion.lat.toFixed(2)}°N, {selectedRegion.lon.toFixed(2)}°E]</p>
                </div>
              </motion.div>
            ) : (
              <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
                <div><h3 className="font-orbitron font-bold text-sm text-white">ALL INDIA GEOSPATIAL SUMMARY</h3><p className="text-xs text-slate-400 font-mono mt-0.5">Click any state, capital or polygon to inspect regional telemetry</p></div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center"><span className="text-slate-400">Total Territories Monitored</span><strong className="text-white text-sm">36 (28 States, 8 UTs)</strong></div>
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex justify-between items-center text-red-300"><span>Critical High Hazard Zones</span><strong className="text-red-400 text-sm">3 Regions</strong></div>
                  <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 flex justify-between items-center text-orange-300"><span>Warning Level Zones</span><strong className="text-orange-400 text-sm">8 Regions</strong></div>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 space-y-1">
                  <p className="font-bold flex items-center space-x-1"><Info className="w-3.5 h-3.5 text-cyan-400" /><span>CAPITAL NAVIGATION:</span></p>
                  <p className="text-[11px] text-slate-300">National Capital <strong>New Delhi</strong> marked with red square icon. State & UT Capitals marked with cyan node markers.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timeline Replay Control Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/30 transition-colors">{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}</button>
            <button onClick={() => { setIsPlaying(false); setCurrentFrameIndex(0); }} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"><RotateCcw className="w-4 h-4" /></button>
            <div><span className="font-orbitron font-bold text-xs text-white">24-HOUR TIMELINE REPLAY</span><p className="text-[11px] text-cyan-400 font-mono">{activeFrame.label}</p></div>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <input type="range" min="0" max={Math.max(0, timelineFrames.length - 1)} value={currentFrameIndex} onChange={(e) => setCurrentFrameIndex(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
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
