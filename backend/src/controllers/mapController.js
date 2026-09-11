import { getLatestScanFromCache } from '../services/satelliteService.js';

const defaultRiskZones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "zone-1",
        name: "Garhwal Himalayan Cloudburst High Danger Zone",
        hazard: "Cloudburst",
        severity: "CRITICAL",
        iwv: 64.2,
        ctt: 204.1,
        cape: 3840,
        color: "#ef4444"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [78.85, 30.60],
            [79.25, 30.60],
            [79.35, 30.90],
            [78.90, 30.90],
            [78.85, 30.60]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "zone-2",
        name: "Teesta Basin Flash Flood Contour",
        hazard: "Flash Flood",
        severity: "CRITICAL",
        iwv: 61.5,
        ctt: 209.8,
        cape: 3100,
        color: "#ff6b35"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.35, 27.40],
            [88.75, 27.40],
            [88.80, 27.70],
            [88.30, 27.70],
            [88.35, 27.40]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "zone-3",
        name: "Kullu Convective Hailstorm Cell",
        hazard: "Hailstorm",
        severity: "WARNING",
        iwv: 53.8,
        ctt: 216.0,
        cape: 2950,
        color: "#eab308"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.90, 31.80],
            [77.30, 31.80],
            [77.35, 32.10],
            [76.95, 32.10],
            [76.90, 31.80]
          ]
        ]
      }
    }
  ]
};

export const getMapRiskZones = async (req, res) => {
  try {
    const scanData = await getLatestScanFromCache();
    const hotspots = scanData?.regional_hotspots || [];

    if (!hotspots || hotspots.length === 0) {
      return res.json(defaultRiskZones);
    }

    const hazard = scanData?.nowcast_assessment?.primary_hazard || 'Severe Convective System';
    const cape = scanData?.summary_metrics?.CAPE_Jkg || 2850;

    const features = hotspots.map((h, idx) => {
      const deltaLat = 0.20;
      const deltaLon = 0.24;
      const color = h.risk === 'CRITICAL' ? '#ef4444' : (h.risk === 'WARNING' ? '#f97316' : '#eab308');

      return {
        type: "Feature",
        properties: {
          id: `zone-sat-${idx + 1}`,
          name: `${h.region} ${h.risk} Hazard Zone`,
          region: h.region,
          hazard: hazard,
          severity: h.risk,
          iwv: h.iwv,
          ctt: h.ctt,
          cape: cape,
          color: color,
          center: [h.lon, h.lat]
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [Number((h.lon - deltaLon).toFixed(4)), Number((h.lat - deltaLat).toFixed(4))],
              [Number((h.lon + deltaLon).toFixed(4)), Number((h.lat - deltaLat).toFixed(4))],
              [Number((h.lon + deltaLon * 1.1).toFixed(4)), Number((h.lat + deltaLat).toFixed(4))],
              [Number((h.lon - deltaLon * 0.95).toFixed(4)), Number((h.lat + deltaLat).toFixed(4))],
              [Number((h.lon - deltaLon).toFixed(4)), Number((h.lat - deltaLat).toFixed(4))]
            ]
          ]
        }
      };
    });

    return res.json({
      type: "FeatureCollection",
      features: features
    });
  } catch (err) {
    console.error('[Map Controller] Failed to generate dynamic risk zones:', err);
    return res.json(defaultRiskZones);
  }
};

export const getMapOverlays = async (req, res) => {
  return res.json({
    layers: [
      { id: 'iwv_vapor', name: 'MOSDAC INSAT-3D Integrated Water Vapor (IWV)', type: 'heatmap', opacity: 0.75, active: true },
      { id: 'ctt_radar', name: 'Cloud Top Temperature (CTT Radar IR)', type: 'tile', opacity: 0.65, active: true },
      { id: 'gpm_rainfall', name: 'GPM 3-Hour Cumulative Rainfall (mm)', type: 'tile', opacity: 0.70, active: false },
      { id: 'assets_layer', name: 'Critical Infrastructure Assets', type: 'markers', active: true }
    ],
    satelliteTimestamp: new Date().toISOString()
  });
};
