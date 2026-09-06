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

export const getAssets = async (req, res) => {
  const { category, risk } = req.query;
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
  const isHighRisk = asset.distanceToHazardKm < 10.0;
  return res.json({
    assetId: asset.id,
    assetName: asset.name,
    riskScore: isHighRisk ? 92.5 : 34.0,
    riskLevel: isHighRisk ? 'CRITICAL_VULNERABILITY' : 'LOW_RISK',
    recommendedMitigation: isHighRisk ? 'Activate structural barrier protocols & notify evacuation commanders' : 'Maintain standard telemetry monitor',
    lastAssessed: new Date().toISOString()
  });
};
