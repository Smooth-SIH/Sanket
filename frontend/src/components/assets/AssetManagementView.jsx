import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Boxes, Plus, ShieldCheck, AlertOctagon, MapPin, Zap, Radio, Building2 } from 'lucide-react';
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-800" />
            <h1 className="font-bold text-xl text-slate-900">
              National Critical Infrastructure Registry & Vulnerability Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Geospatial Proximity Assessment for Hydroelectric Dams, Power Grids, and Disaster Relief Camps
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Critical Asset</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center space-x-2 overflow-x-auto">
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap pl-1">Filter by Category:</span>
        {['ALL', 'HYDRO_DAM', 'POWER_GRID', 'TELECOM_TOWER', 'BRIDGE', 'HOSPITAL', 'RELIEF_CAMP'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold'
                : 'text-slate-600 border border-transparent hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className={`p-5 rounded-lg bg-white border flex flex-col justify-between transition-all shadow-sm ${
              asset.currentRiskStatus === 'EVACUATION_REQUIRED'
                ? 'border-red-400 ring-1 ring-red-300'
                : asset.currentRiskStatus === 'HIGH_DANGER'
                ? 'border-amber-400'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {asset.category.replace('_', ' ')}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  asset.currentRiskStatus === 'EVACUATION_REQUIRED' ? 'bg-red-600 text-white' :
                  asset.currentRiskStatus === 'HIGH_DANGER' ? 'bg-amber-600 text-white' :
                  asset.currentRiskStatus === 'MODERATE' ? 'bg-yellow-400 text-slate-900' : 'bg-emerald-600 text-white'
                }`}>
                  {asset.currentRiskStatus.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mb-2">
                {asset.name}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                <p>Jurisdiction: <span className="font-medium text-slate-900 font-sans">{asset.region}</span></p>
                <p>Coordinates: <span className="text-slate-800">{asset.lat}° N, {asset.lon}° E</span></p>
                <p>Elevation: <span className="text-slate-800">{asset.elevationMeters} meters ASL</span></p>
                <p>Vulnerability Index: <span className="text-blue-800 font-bold">{asset.criticalityScore} / 10.0</span></p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-sans">Distance to Convective Core:</span>
              <span className="text-slate-900 font-bold">{asset.distanceToHazardKm} km</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddAsset} className="p-6 rounded-lg bg-white border border-slate-300 shadow-xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Register New Critical Asset
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Asset Name</label>
              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. Alaknanda Substation Grid"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Category</label>
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
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
                <label className="text-xs font-medium text-slate-700 block mb-1">Latitude (°N)</label>
                <input
                  type="text"
                  value={latVal}
                  onChange={(e) => setLatVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Longitude (°E)</label>
                <input
                  type="text"
                  value={lonVal}
                  onChange={(e) => setLonVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Region / Jurisdiction</label>
              <input
                type="text"
                value={regionVal}
                onChange={(e) => setRegionVal(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm"
              >
                Save Asset
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
