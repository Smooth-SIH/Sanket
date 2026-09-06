"""
MOSDAC INSAT-3D / INSAT-3DR Satellite Ingestion & Parameter Extractor.
"""

import datetime
import numpy as np


class MOSDACInsatFetcher:
    """
    Simulates real-time ingestion & parameter extraction from ISRO MOSDAC.
    """

    def __init__(self):
        self.satellite_id = "INSAT-3DR"
        self.sensor_type = "Sounder + Imager (19 Channels)"
        self.coverage_bounds = {
            "lat_min": 8.0, "lat_max": 37.0,
            "lon_min": 68.0, "lon_max": 97.0
        }

    def fetch_latest_scan(self) -> dict:
        """Fetch/Synthesize latest 5-minute INSAT-3D scan."""
        now = datetime.datetime.utcnow()
        scan_id = f"MOSDAC_{now.strftime('%Y%m%d_%H%M%S')}"

        time_seed = int(now.timestamp()) // 300
        np.random.seed(time_seed % 10000)

        is_convective = np.random.rand() > 0.3

        iwv = round(
            float(np.random.uniform(54.0, 68.0) if is_convective
                  else np.random.uniform(25.0, 48.0)), 2
        )
        ctt = round(
            float(np.random.uniform(198.0, 218.0) if is_convective
                  else np.random.uniform(240.0, 280.0)), 2
        )
        cape = round(
            float(np.random.uniform(2400.0, 4200.0) if is_convective
                  else np.random.uniform(400.0, 1600.0)), 1
        )
        cin = round(
            float(np.random.uniform(5.0, 35.0) if is_convective
                  else np.random.uniform(80.0, 220.0)), 1
        )
        rain_rate = round(
            float(np.random.uniform(45.0, 120.0) if is_convective
                  else np.random.uniform(0.0, 15.0)), 2
        )
        wind = round(
            float(np.random.uniform(40.0, 95.0) if is_convective
                  else np.random.uniform(10.0, 30.0)), 1
        )
        humidity = round(
            float(np.random.uniform(82.0, 99.0) if is_convective
                  else np.random.uniform(50.0, 75.0)), 1
        )

        grid_hotspots = [
            {
                "region": "Uttarakhand (Garhwal)",
                "lat": 30.73, "lon": 79.06,
                "iwv": iwv, "ctt": ctt,
                "risk": "CRITICAL" if iwv > 55 else "WATCH"
            },
            {
                "region": "Himachal (Kullu Valley)",
                "lat": 31.95, "lon": 77.10,
                "iwv": round(iwv * 0.92, 1), "ctt": round(ctt + 5, 1),
                "risk": "WARNING"
            },
            {
                "region": "Western Ghats (Wayanad)",
                "lat": 11.68, "lon": 76.13,
                "iwv": round(iwv * 0.88, 1), "ctt": round(ctt + 10, 1),
                "risk": "WATCH"
            },
            {
                "region": "Assam (Barak Valley)",
                "lat": 24.81, "lon": 92.79,
                "iwv": round(iwv * 0.95, 1), "ctt": round(ctt + 2, 1),
                "risk": "CRITICAL" if iwv > 55 else "WARNING"
            }
        ]

        return {
            "scan_id": scan_id,
            "timestamp": now.isoformat() + "Z",
            "satellite": self.satellite_id,
            "sensor": self.sensor_type,
            "status": "ONLINE",
            "summary_metrics": {
                "IWV_mm": iwv,
                "CTT_K": ctt,
                "CTT_Celsius": round(ctt - 273.15, 1),
                "CAPE_Jkg": cape,
                "CIN_Jkg": cin,
                "rain_rate_mmh": rain_rate,
                "wind_speed_kmh": wind,
                "humidity_pct": humidity,
                "lifted_index": round(-5.2 if is_convective else -1.1, 1),
                "k_index": round(38.5 if is_convective else 22.0, 1)
            },
            "regional_hotspots": grid_hotspots
        }


insat_fetcher = MOSDACInsatFetcher()
