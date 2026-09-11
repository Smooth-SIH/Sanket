let sampleAlerts = [
  {
    id: 'ALT-901',
    title: 'EXTREME CLOUDBURST RISK - KEDARNATH / GARHWAL VALLEY',
    hazardType: 'Cloudburst',
    severity: 'CRITICAL',
    riskScore: 96.4,
    leadTimeMins: 28,
    affectedRegion: 'Kedarnath Basin, Chamoli & Rudraprayag',
    coordinates: [79.06, 30.73],
    parameters: { IWV_mm: 64.2, CTT_K: 204.1, CAPE_Jkg: 3840, rain_rate_mmh: 112.5 },
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'ALT-902',
    title: 'SEVERE CONVECTIVE THUNDERSTORM & HAILSTORM',
    hazardType: 'Hailstorm',
    severity: 'WARNING',
    riskScore: 78.2,
    leadTimeMins: 55,
    affectedRegion: 'Kullu & Solan Hills, Himachal Pradesh',
    coordinates: [77.10, 31.95],
    parameters: { IWV_mm: 53.8, CTT_K: 216.0, CAPE_Jkg: 2950, rain_rate_mmh: 48.0 },
    acknowledged: true,
    acknowledgedBy: 'Command Officer',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'ALT-903',
    title: 'FLASH FLOOD SURGE INUNDATION ADVISORY',
    hazardType: 'Flash Flood',
    severity: 'CRITICAL',
    riskScore: 91.0,
    leadTimeMins: 35,
    affectedRegion: 'Teesta River Basin, Sikkim Upper Catchment',
    coordinates: [88.51, 27.53],
    parameters: { IWV_mm: 61.5, CTT_K: 209.8, CAPE_Jkg: 3100, rain_rate_mmh: 94.0 },
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString()
  },
  {
    id: 'ALT-904',
    title: 'HIGH INTENSITY MESOSCALE CONVECTIVE SYSTEM',
    hazardType: 'Severe Thunderstorm',
    severity: 'WATCH',
    riskScore: 54.0,
    leadTimeMins: 110,
    affectedRegion: 'Wayanad Plateau & Nilgiri Foothills',
    coordinates: [76.13, 11.68],
    parameters: { IWV_mm: 48.2, CTT_K: 228.4, CAPE_Jkg: 2100, rain_rate_mmh: 28.0 },
    acknowledged: true,
    acknowledgedBy: 'Command Officer',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
];

/**
 * Synchronizes active operational alerts with real satellite scan convective hotspots.
 */
export const syncAlertsWithSatellite = (scanData) => {
  if (!scanData || !scanData.regional_hotspots) return sampleAlerts;

  const assessment = scanData.nowcast_assessment || {};
  const hazard = assessment.primary_hazard || 'Severe Convective Storm';
  const leadTime = assessment.estimated_lead_time_mins || 40;

  // Filter hotspots that warrant an active alert (CRITICAL or WARNING)
  const severeHotspots = scanData.regional_hotspots.filter(
    h => h.risk === 'CRITICAL' || h.risk === 'WARNING'
  );

  severeHotspots.forEach(hotspot => {
    const slug = hotspot.region.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 12);
    const alertId = `ALT-SAT-${slug}`;

    const existingIdx = sampleAlerts.findIndex(a => a.id === alertId);

    const calculatedRiskScore = hotspot.risk === 'CRITICAL'
      ? Math.max(86.5, assessment.overall_risk_score || 88.0)
      : Math.min(82.0, Math.max(68.0, assessment.overall_risk_score || 72.0));

    const alertData = {
      id: alertId,
      title: `${hotspot.risk} ${hazard.toUpperCase()} ADVISORY - ${hotspot.region.toUpperCase()}`,
      hazardType: hazard,
      severity: hotspot.risk,
      riskScore: calculatedRiskScore,
      leadTimeMins: leadTime,
      affectedRegion: hotspot.region,
      coordinates: [hotspot.lon, hotspot.lat],
      parameters: {
        IWV_mm: hotspot.iwv,
        CTT_K: hotspot.ctt,
        CAPE_Jkg: scanData.summary_metrics?.CAPE_Jkg || 2850,
        rain_rate_mmh: scanData.summary_metrics?.rain_rate_mmh || 58.0
      },
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      createdAt: scanData.timestamp || new Date().toISOString()
    };

    if (existingIdx >= 0) {
      // Preserve acknowledge status if not newly elevated
      const prev = sampleAlerts[existingIdx];
      sampleAlerts[existingIdx] = {
        ...alertData,
        acknowledged: prev.severity === alertData.severity ? prev.acknowledged : false,
        acknowledgedBy: prev.severity === alertData.severity ? prev.acknowledgedBy : null,
        acknowledgedAt: prev.severity === alertData.severity ? prev.acknowledgedAt : null
      };
    } else {
      sampleAlerts.unshift(alertData);
    }
  });

  return sampleAlerts;
};

export const getAlerts = async (req, res) => {
  const { hazard, severity, acknowledged } = req.query;
  let filtered = [...sampleAlerts];

  if (hazard) {
    filtered = filtered.filter(a => a.hazardType.toLowerCase() === hazard.toLowerCase());
  }
  if (severity) {
    filtered = filtered.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  }
  if (acknowledged !== undefined) {
    const isAck = acknowledged === 'true';
    filtered = filtered.filter(a => a.acknowledged === isAck);
  }

  return res.json({
    total: filtered.length,
    activeCount: sampleAlerts.filter(a => !a.acknowledged).length,
    criticalCount: sampleAlerts.filter(a => a.severity === 'CRITICAL').length,
    alerts: filtered
  });
};

export const acknowledgeAlert = async (req, res) => {
  const alert = sampleAlerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });

  // Resolve official officer identity
  let acknowledgingOfficer = req.body.officerName;
  if (!acknowledgingOfficer && req.user) {
    acknowledgingOfficer = `${req.user.name} (${req.user.organization || req.user.role})`;
  }
  if (!acknowledgingOfficer) {
    acknowledgingOfficer = 'Command Center Duty Officer';
  }

  alert.acknowledged = true;
  alert.acknowledgedBy = acknowledgingOfficer;
  alert.acknowledgedAt = new Date().toISOString();

  return res.json({
    message: 'Alert successfully acknowledged',
    alert
  });
};

export const createManualAlert = async (req, res) => {
  const { title, hazardType, severity, affectedRegion, riskScore, leadTimeMins } = req.body;
  const newAlert = {
    id: `ALT-${Date.now()}`,
    title: title || `MANUAL ${hazardType} WARNING`,
    hazardType: hazardType || 'Cloudburst',
    severity: severity || 'WARNING',
    riskScore: parseFloat(riskScore || 75.0),
    leadTimeMins: parseInt(leadTimeMins || 45),
    affectedRegion: affectedRegion || 'Central Himalayas',
    coordinates: [78.5, 30.5],
    parameters: { IWV_mm: 56.0, CTT_K: 210.0, CAPE_Jkg: 3000, rain_rate_mmh: 60.0 },
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: new Date().toISOString()
  };
  sampleAlerts.unshift(newAlert);
  return res.status(201).json(newAlert);
};
