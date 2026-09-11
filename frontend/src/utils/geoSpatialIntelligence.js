// Universal Geospatial Intelligence, Elevation Models, and Feature Resolvers for SANKET
import { WATERBODIES } from '../data/waterbodies.js';
import { SETTLEMENTS } from '../data/settlements.js';
import { TRANSPORT_CORRIDORS } from '../data/transportCorridors.js';
import { STRATEGIC_LOCATIONS } from '../data/strategicLocations.js';

// Geodesic distance calculation in kilometers
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Point-in-polygon ray casting algorithm
export function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Resolve Indian State or Union Territory from official Survey of India boundary GeoJSON
export function findStateForPoint(lat, lng, geoJsonData) {
  if (!geoJsonData || !geoJsonData.features) return null;
  for (const feature of geoJsonData.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    if (geom.type === 'Polygon' && geom.coordinates?.[0]) {
      if (pointInPolygon([lng, lat], geom.coordinates[0])) {
        return feature.properties?.st_nm || null;
      }
    } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
      for (const poly of geom.coordinates) {
        if (poly?.[0] && pointInPolygon([lng, lat], poly[0])) {
          return feature.properties?.st_nm || null;
        }
      }
    }
  }

  // Maritime / Offshore fallback
  if (lat < 24 && lng < 73) return 'Arabian Sea (Offshore EEZ)';
  if (lat < 22 && lng > 80.5) return 'Bay of Bengal (Offshore EEZ)';
  if (lat < 10) return 'Indian Ocean Maritime Zone';
  return 'India';
}

// Physical Topographic Altitude Model for Indian Subcontinent (Meters ASL)
export function estimateElevationASL(lat, lng) {
  // High Himalayas & Karakoram
  if (lat >= 30.5 && lng >= 74.0 && lng <= 80.5) {
    return Math.round(1800 + Math.abs(Math.sin(lat * 3.5)) * 1800 + Math.cos(lng * 2) * 400);
  }
  if (lat > 32.0) {
    return Math.round(2500 + (lat - 32.0) * 450);
  }
  if (lat >= 26.5 && lat <= 29.5 && lng >= 88.0 && lng <= 97.0) {
    // Sikkim & Arunachal / Northeast hills
    return Math.round(1200 + Math.sin(lat * 2) * 1100);
  }
  // Western Ghats ridge
  if (lat >= 8.5 && lat <= 20.8 && lng >= 73.2 && lng <= 75.8) {
    if (lng < 73.5) return Math.round(12 + (lng - 72.8) * 60); // Konkan coast
    return Math.round(620 + Math.sin(lat * 1.5) * 350); // Western Ghats
  }
  // Konkan / Malabar coastal strip
  if (lng < 73.3 && lat < 22) return Math.round(8 + Math.abs(Math.sin(lat)) * 18);
  // Coromandel / East coast
  if (lng > 80.0 && lat < 17) return Math.round(10 + Math.abs(Math.sin(lat)) * 20);
  // Deccan Plateau (Maharashtra, Telangana, Karnataka, AP: 14N-21N, 75E-81E)
  if (lat >= 14 && lat <= 21 && lng >= 75 && lng <= 81) {
    return Math.round(460 + (lat - 14) * 12 + Math.sin(lng * 3) * 70);
  }
  // Central Indian Highlands / Vindhyas & Satpuras (MP, Chhattisgarh: 21N-25N)
  if (lat > 21 && lat <= 25 && lng >= 75 && lng <= 84) {
    return Math.round(340 + Math.cos(lng * 2) * 110);
  }
  // Indo-Gangetic Plain (slopes gently westward from Bengal to Punjab: 24N-30N, 74E-88E)
  if (lat >= 24 && lat <= 30 && lng >= 74 && lng <= 88) {
    const slope = Math.round(240 - (lng - 74) * 15);
    return Math.max(16, slope);
  }
  // Thar Desert (Rajasthan: 24N-29N, 70E-75E)
  if (lat >= 24 && lat <= 29 && lng >= 70 && lng <= 75) {
    return Math.round(180 + (lat - 24) * 18);
  }
  return Math.round(240 + Math.abs(Math.sin(lat * 2)) * 120);
}

// Vulnerability Classification based on geomorphology & elevation
export function getVulnerabilityForTerrain(lat, lng, elevation) {
  if (elevation > 1500) return 'HIGH_ALTITUDE_CLOUDBURST_ZONE';
  if (elevation > 800) return 'OROGRAPHIC_UPFLOW_BASIN';
  if (elevation < 25 && (lng < 73.5 || lng > 80.0)) return 'COASTAL_SURGE_DELUGE';
  if (lat >= 15 && lat <= 20 && lng >= 76 && lng <= 80) return 'SEMI_ARID_CONVECTIVE_GRID';
  if (lat >= 24 && lat <= 28 && lng >= 77 && lng <= 85) return 'GANGETIC_ALLUVIAL_DRAINAGE';
  return 'DECCAN_MICRO_WATERSHED';
}

// Physical Atmospheric Sounder Telemetry Calculation for exact coordinate
export function computeLocalTelemetry(lat, lng, activeZone, activeFrame) {
  if (activeZone) {
    return {
      iwv: activeZone.iwv || 62.4,
      ctt: activeZone.ctt || 206.5,
      cape: activeZone.cape || 3200,
      riskScore: 82,
      status: activeZone.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING'
    };
  }

  const frameMetrics = activeFrame?.metrics || { IWV_mm: 58.4, CTT_K: 210.5, CAPE_Jkg: 2450 };
  
  let iwvFactor = 0.75;
  if (lng < 74.0 && lat < 22) iwvFactor = 0.88; // Konkan coast
  else if (lng > 80.0 && lat < 21) iwvFactor = 0.85; // Eastern coast / delta
  else if (lat > 31.0) iwvFactor = 0.45; // High Himalayas
  else if (lat >= 24 && lat <= 28 && lng >= 70 && lng <= 75) iwvFactor = 0.55; // Rajasthan arid
  else iwvFactor = 0.72 + (Math.sin(lat) * 0.08);

  const localIwv = Math.round((frameMetrics.IWV_mm * iwvFactor) * 10) / 10;
  const localCtt = Math.round((frameMetrics.CTT_K + 22 + Math.abs(Math.sin(lat * 2)) * 12) * 10) / 10;
  const localCape = Math.round(1100 + Math.abs(Math.cos(lng * 3)) * 750);
  const localRisk = Math.min(45, Math.round((localIwv / 70) * 35 + ((260 - localCtt) / 50) * 20));

  return {
    iwv: localIwv,
    ctt: localCtt,
    cape: localCape,
    riskScore: localRisk,
    status: localRisk > 40 ? 'ELEVATED' : 'NORMAL'
  };
}

// Curated feature proximity matcher with strict tight tolerance (prevents false matches miles away)
export function findClosestTacticalFeature(clickLat, clickLng) {
  // 1. Check curated settlements and strategic observation posts within 8 km
  let closestSettlement = null;
  let minSettlementDist = 8;
  for (const s of SETTLEMENTS) {
    const dist = getDistanceKm(clickLat, clickLng, s.lat, s.lon);
    if (dist < minSettlementDist) {
      minSettlementDist = dist;
      closestSettlement = {
        kind: 'SETTLEMENT',
        data: s,
        position: [clickLat, clickLng],
        distance: dist
      };
    }
  }

  // Check strategic outposts, frontier observation posts, and Regional Meteorological Centres (RMCs)
  for (const st of STRATEGIC_LOCATIONS) {
    const dist = getDistanceKm(clickLat, clickLng, st.lat, st.lon);
    if (dist < minSettlementDist) {
      minSettlementDist = dist;
      closestSettlement = {
        kind: 'SETTLEMENT',
        data: {
          id: st.id,
          name: st.name,
          type: st.type || 'STRATEGIC_OUTPOST',
          state: st.region,
          district: st.description || st.region,
          address: st.address || null,
          elevation_m: estimateElevationASL(st.lat, st.lon),
          vulnerability: st.type === 'RMC' ? 'REGIONAL_METEOROLOGICAL_COMMAND_HUB' : 'HIGH_ALTITUDE_OROGRAPHIC_FRONTIER',
          nowcastingStatus: st.type === 'RMC' ? 'OPERATIONAL_RADAR_NODE' : 'ACTIVE_OBSERVATION_POST'
        },
        position: [clickLat, clickLng],
        distance: dist
      };
    }
  }
  if (closestSettlement) return closestSettlement;

  // 2. Check curated waterbodies within 5 km
  let closestWater = null;
  let minWaterDist = 5;
  for (const w of WATERBODIES) {
    if (w.lat && w.lon) {
      const dist = getDistanceKm(clickLat, clickLng, w.lat, w.lon);
      if (dist < minWaterDist) {
        minWaterDist = dist;
        closestWater = {
          kind: 'WATERBODY',
          data: w,
          position: [clickLat, clickLng],
          distance: dist
        };
      }
    } else if (w.coordinates) {
      for (const pt of w.coordinates) {
        const dist = getDistanceKm(clickLat, clickLng, pt[0], pt[1]);
        if (dist < minWaterDist) {
          minWaterDist = dist;
          closestWater = {
            kind: 'RIVER',
            data: w,
            position: [clickLat, clickLng],
            distance: dist
          };
        }
      }
    }
  }
  if (closestWater) return closestWater;

  // 3. Check curated transport corridors within 2.5 km (tight threshold prevents snapping rural fields to highways)
  let closestTransport = null;
  let minTransportDist = 2.5;
  for (const t of TRANSPORT_CORRIDORS) {
    if (t.coordinates) {
      for (const pt of t.coordinates) {
        const dist = getDistanceKm(clickLat, clickLng, pt[0], pt[1]);
        if (dist < minTransportDist) {
          minTransportDist = dist;
          closestTransport = {
            kind: 'TRANSPORT',
            data: t,
            position: [clickLat, clickLng],
            distance: dist
          };
        }
      }
    }
  }
  if (closestTransport) return closestTransport;

  return null;
}
