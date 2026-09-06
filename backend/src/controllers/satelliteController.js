import { getLatestScanFromCache, fetchAndProcessSatelliteData } from '../services/satelliteService.js';

export const getLatestSatelliteScan = async (req, res, next) => {
  try {
    const scan = await getLatestScanFromCache();
    return res.json(scan);
  } catch (err) {
    next(err);
  }
};

export const triggerSatelliteIngest = async (req, res, next) => {
  try {
    const freshScan = await fetchAndProcessSatelliteData();
    return res.json({
      message: 'Fresh MOSDAC INSAT-3D scan ingested & broadcasted',
      scan: freshScan
    });
  } catch (err) {
    next(err);
  }
};

export const getSatelliteTimeline = async (req, res) => {
  // Generate 12 historical replay frames spaced by 1 hour
  const now = Date.now();
  const frames = [];

  for (let i = 12; i >= 0; i--) {
    const t = new Date(now - i * 3600 * 1000);
    const iwv = Number((42.0 + Math.sin(i * 0.5) * 18.0 + (i === 1 ? 12 : 0)).toFixed(1));
    const ctt = Number((230.0 - Math.sin(i * 0.5) * 22.0 - (i === 1 ? 15 : 0)).toFixed(1));
    const cape = Math.round(1500 + Math.sin(i * 0.5) * 1800 + (i === 1 ? 1200 : 0));

    frames.push({
      frameIndex: 12 - i,
      timestamp: t.toISOString(),
      label: `${t.getUTCHours().toString().padStart(2, '0')}:${t.getUTCMinutes().toString().padStart(2, '0')} UTC`,
      metrics: {
        IWV_mm: iwv,
        CTT_K: ctt,
        CAPE_Jkg: cape,
        rain_rate_mmh: Number((iwv * 0.9).toFixed(1))
      },
      maxRiskScore: Math.round(Math.min(99, (iwv / 65) * 95))
    });
  }

  return res.json({
    count: frames.length,
    frames
  });
};
