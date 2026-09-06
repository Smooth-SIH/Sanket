import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Boxes, Plus, ShieldCheck, AlertOctagon, MapPin, Zap, Radio } from 'lucide-react';
import { fetchAssets } from '../../services/api';
import { setAssets } from '../../store/slices/assetSlice';

export const AssetManagementView = () => {
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.assets.assets);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('HYDRO_DAM');
  const [latVal, setLatVal] = useState('30.73');
  const [lonVal, setLonVal] = useState('79.06');
  const [regionVal, setRegionVal] = useState('Garhwal Himalayas');

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const data = await fetchAssets();
        dispatch(setAssets(data.assets || []));
      } catch (err) {
        console.error(err);
      }
    };
    loadAssets();
  }, [dispatch]);

  const handleAddAsset = (e) => {
    e.preventDefault();
    const newAsset = {
      id: `ast-${Date.now()}`,
      name: assetName || 'New Infrastructure Asset',
      category: assetCategory,
      lat: parseFloat(latVal),
      lon: parseFloat(lonVal),
      region: regionVal,
      elevationMeters: 1200,
      criticalityScore: 9.0,
      currentRiskStatus: 'SAFE',
      distanceToHazardKm: 18.5
    };
    dispatch(setAssets([newAsset, ...assets]));
    setShowAddModal(false);
    setAssetName('');
  };

  const filteredAssets = selectedCategory === 'ALL'
    ? assets
    : assets.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl lg:text-3xl text-white">
            CRITICAL ASSET MANAGEMENT
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Proximity Hazard Tracking for High-Value Infrastructure & Relief Sites
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-orbitron font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW ASSET</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-2 overflow-x-auto">
        {['ALL', 'HYDRO_DAM', 'POWER_GRID', 'TELECOM_TOWER', 'BRIDGE', 'HOSPITAL', 'RELIEF_CAMP'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className={`p-6 rounded-2xl glass-panel border flex flex-col justify-between transition-all ${
              asset.currentRiskStatus === 'EVACUATION_REQUIRED'
                ? 'border-red-500/50 shadow-glow-red'
                : asset.currentRiskStatus === 'HIGH_DANGER'
                ? 'border-orange-500/50'
                : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20 uppercase">
                  {asset.category}
                </span>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  asset.currentRiskStatus === 'EVACUATION_REQUIRED' ? 'bg-red-600 text-white animate-pulse' :
                  asset.currentRiskStatus === 'HIGH_DANGER' ? 'bg-orange-600 text-white' :
                  asset.currentRiskStatus === 'MODERATE' ? 'bg-yellow-600 text-black' : 'bg-emerald-600 text-white'
                }`}>
                  {asset.currentRiskStatus}
                </span>
              </div>

              <h3 className="font-orbitron font-bold text-base text-white mb-2">
                {asset.name}
              </h3>

              <div className="space-y-1 text-xs text-slate-400 font-mono">
                <p>Region: <span className="text-slate-200">{asset.region}</span></p>
                <p>Coords: <span className="text-slate-200">{asset.lat}° N, {asset.lon}° E</span></p>
                <p>Elevation: <span className="text-slate-200">{asset.elevationMeters} meters</span></p>
                <p>Criticality Score: <span className="text-cyan-400 font-bold">{asset.criticalityScore} / 10</span></p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Hazard Distance:</span>
              <span className="text-orange-400 font-bold">{asset.distanceToHazardKm} km</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddAsset} className="p-6 rounded-3xl glass-panel border border-cyan-500/40 max-w-md w-full space-y-4">
            <h3 className="font-orbitron font-bold text-lg text-white">
              REGISTER INFRASTRUCTURE ASSET
            </h3>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Asset Name</label>
              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. Alaknanda Substation Grid"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none"
              >
                <option value="HYDRO_DAM">HYDRO_DAM</option>
                <option value="POWER_GRID">POWER_GRID</option>
                <option value="TELECOM_TOWER">TELECOM_TOWER</option>
                <option value="BRIDGE">BRIDGE</option>
                <option value="HOSPITAL">HOSPITAL</option>
                <option value="RELIEF_CAMP">RELIEF_CAMP</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Latitude (°N)</label>
                <input
                  type="text"
                  value={latVal}
                  onChange={(e) => setLatVal(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Longitude (°E)</label>
                <input
                  type="text"
                  value={lonVal}
                  onChange={(e) => setLonVal(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Region / Sector</label>
              <input
                type="text"
                value={regionVal}
                onChange={(e) => setRegionVal(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-orbitron font-bold text-xs"
              >
                SAVE ASSET
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
