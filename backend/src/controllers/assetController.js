import { getLatestScanFromCache } from '../services/satelliteService.js';

let sampleAssets = [
  {
    id: 'ast-101',
    name: 'Teesta Stage-III Hydro Power Dam',
    category: 'HYDRO_DAM',
    lat: 27.59,
    lon: 88.64,
    region: 'North Sikkim',
    elevationMeters: 1450,
    criticalityScore: 9.8,
    currentRiskStatus: 'HIGH_DANGER',
    distanceToHazardKm: 4.2
  },
  {
    id: 'ast-102',
    name: 'Rishikesh-Badrinath National Highway Bridge',
    category: 'BRIDGE',
    lat: 30.13,
    lon: 78.32,
    region: 'Uttarakhand (Garhwal)',
    elevationMeters: 360,
    criticalityScore: 9.2,
    currentRiskStatus: 'HIGH_DANGER',
    distanceToHazardKm: 1.8
  },
  {
    id: 'ast-103',
    name: 'Tehri Substation & Power Grid 765kV',
    category: 'POWER_GRID',
    lat: 30.37,
    lon: 78.47,
    region: 'Uttarakhand',
    elevationMeters: 800,
    criticalityScore: 9.5,
    currentRiskStatus: 'MODERATE',
    distanceToHazardKm: 14.5
  },
  {
    id: 'ast-104',
    name: 'Kedarnath Emergency Relief Camp Base',
    category: 'RELIEF_CAMP',
    lat: 30.73,
    lon: 79.06,
    region: 'Kedarnath Valley',
    elevationMeters: 3580,
    criticalityScore: 10.0,
    currentRiskStatus: 'EVACUATION_REQUIRED',
    distanceToHazardKm: 0.5
  },
  {
    id: 'ast-105',
    name: 'Wayand Telecom Relay Tower Site 4',
    category: 'TELECOM_TOWER',
    lat: 11.68,
    lon: 76.13,
    region: 'Western Ghats (Kerala)',
    elevationMeters: 920,
    criticalityScore: 8.1,
    currentRiskStatus: 'MODERATE',
    distanceToHazardKm: 18.2
  },
  {
    id: 'ast-106',
    name: 'Guwahati AIIMS Emergency Trauma Wing',
    category: 'HOSPITAL',
    lat: 26.14,
    lon: 91.73,
    region: 'Assam Coastal Belt',
    elevationMeters: 55,
    criticalityScore: 9.9,
    currentRiskStatus: 'SAFE',
    distanceToHazardKm: 42.0
  }
];

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const getAssets = async (req, res) => {
  const { category, risk } = req.query;

  try {
    const scanData = await getLatestScanFromCache();
    const severeHotspots = scanData?.regional_hotspots?.filter(
      h => h.risk === 'CRITICAL' || h.risk === 'WARNING'
    ) || [];

    if (severeHotspots.length > 0) {
      sampleAssets.forEach(asset => {
        let minDistance = Infinity;
        let closestHotspot = null;
        for (const h of severeHotspots) {
          const dist = getHaversineDistanceKm(asset.lat, asset.lon, h.lat, h.lon);
          if (dist < minDistance) {
            minDistance = dist;
            closestHotspot = h;
          }
        }
        asset.distanceToHazardKm = minDistance;
        asset.nearestHazardRegion = closestHotspot?.region || null;

        if (minDistance < 8.0) {
          asset.currentRiskStatus = 'EVACUATION_REQUIRED';
        } else if (minDistance < 35.0) {
          asset.currentRiskStatus = 'HIGH_DANGER';
        } else if (minDistance < 75.0) {
          asset.currentRiskStatus = 'MODERATE';
        } else {
          asset.currentRiskStatus = 'SAFE';
        }
      });
    }
  } catch (err) {
    console.error('[Asset Controller] Failed to update asset proximity:', err);
  }

  let filtered = [...sampleAssets];

  if (category) {
    filtered = filtered.filter(a => a.category === category);
  }
  if (risk) {
    filtered = filtered.filter(a => a.currentRiskStatus === risk);
  }

  return res.json({
    total: filtered.length,
    assets: filtered
  });
};

export const getAssetById = async (req, res) => {
  const asset = sampleAssets.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  return res.json(asset);
};

export const createAsset = async (req, res) => {
  const { name, category, lat, lon, region, elevationMeters, criticalityScore } = req.body;
  const newAsset = {
    id: `ast-${Date.now()}`,
    name,
    category: category || 'TELECOM_TOWER',
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    region: region || 'Himalayan Corridor',
    elevationMeters: parseFloat(elevationMeters || 1000),
    criticalityScore: parseFloat(criticalityScore || 8.0),
    currentRiskStatus: 'SAFE',
    distanceToHazardKm: 25.0
  };
  sampleAssets.push(newAsset);
  return res.status(201).json(newAsset);
};

export const assessAssetRisk = async (req, res) => {
  const asset = sampleAssets.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ message: 'Asset not found' });

  // Compute dynamic risk based on proximity and vulnerability
  const isCritical = asset.distanceToHazardKm < 10.0;
  const isHighDanger = asset.distanceToHazardKm < 35.0;

  return res.json({
    assetId: asset.id,
    assetName: asset.name,
    riskScore: isCritical ? 94.5 : isHighDanger ? 78.0 : 25.0,
    riskLevel: isCritical ? 'EVACUATION_REQUIRED' : isHighDanger ? 'HIGH_DANGER' : 'LOW_RISK',
    recommendedMitigation: isCritical 
      ? 'Activate immediate structural barrier protocols & execute local evacuation' 
      : isHighDanger
      ? 'Engage standby flood barriers & notify incident commanders'
      : 'Maintain standard telemetry monitor',
    nearestHazardRegion: asset.nearestHazardRegion || 'Distant Corridor',
    distanceToHazardKm: asset.distanceToHazardKm,
    lastAssessed: new Date().toISOString()
  });
};
