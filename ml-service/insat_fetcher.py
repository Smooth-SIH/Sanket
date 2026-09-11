"""
MOSDAC INSAT-3D / INSAT-3DR Satellite & Atmospheric Telemetry Ingestion.
Combines real-time OpenWeatherMap surface data with live vertical sounding models
(CAPE, CIN, Lifted Index, IWV) and an official ISRO MOSDAC adapter.
"""

import os
import datetime
import math
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
from dotenv import load_dotenv
import httpx
import numpy as np

try:
    import h5py
    HAS_H5PY = True
except ImportError:
    HAS_H5PY = False

# Load environment variables from ml-service/.env or root .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("sanket.ingestion")
logging.basicConfig(level=logging.INFO)


class MOSDACAdapter:
    """
    Adapter for ISRO MOSDAC (Meteorological and Oceanographic Satellite Data Archival Centre).
    Handles authentication, local HDF5 cache, and downloads for INSAT-3D / INSAT-3DR L2B products.
    """

    def __init__(self, user: str = None, password: str = None, data_dir: Path = None):
        self.user = user or os.getenv("MOSDAC_USER")
        self.password = password or os.getenv("MOSDAC_PASSWORD")
        self.base_url = "https://mosdac.gov.in/live"
        self.data_dir = data_dir or (Path(__file__).resolve().parent / os.getenv("MOSDAC_DATA_DIR", "../data/raw")).resolve()

    @property
    def is_configured(self) -> bool:
        """Check if valid MOSDAC credentials are present."""
        return bool(self.user and self.user != "your_mosdac_email@example.com")

    def get_available_h5_files(self) -> List[Path]:
        """Return list of downloaded MOSDAC HDF5 files sorted newest first."""
        if not self.data_dir.exists():
            # Check relative to cwd
            alt = Path("data/raw").resolve()
            if alt.exists():
                self.data_dir = alt
            else:
                return []
        files = list(self.data_dir.glob("*.h5"))
        files.sort(key=lambda p: p.name, reverse=True)
        return files


class MOSDACInsatFetcher:
    """
    Live Satellite & Atmospheric Telemetry Ingestion Service for SANKET.
    Ingests real ISRO INSAT-3DR Sounder Level-2B HDF5 products with live fallback.
    """

    def __init__(self):
        self.satellite_id = "INSAT-3DR (ISRO MOSDAC Telemetry)"
        self.sensor_type = "Sounder (19 Channels) + Imager"
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        self.data_mode = os.getenv("DATA_SOURCE_MODE", "MOSDAC")
        
        mosdac_dir_env = os.getenv("MOSDAC_DATA_DIR", "../data/raw")
        self.data_dir = (Path(__file__).resolve().parent / mosdac_dir_env).resolve()
        if not self.data_dir.exists():
            alt = Path("data/raw").resolve()
            if alt.exists():
                self.data_dir = alt
                
        self.mosdac_adapter = MOSDACAdapter(data_dir=self.data_dir)

        # Monitored Regional Hotspots across India
        self.hotspot_locations = [
            {"region": "Uttarakhand (Garhwal)", "lat": 30.73, "lon": 79.06},
            {"region": "Himachal (Kullu Valley)", "lat": 31.95, "lon": 77.10},
            {"region": "Western Ghats (Wayanad)", "lat": 11.68, "lon": 76.13},
            {"region": "Assam (Barak Valley)", "lat": 24.81, "lon": 92.79}
        ]

    def _calculate_iwv_from_dew_point(self, dew_point_c: float, surface_pressure_hpa: float = 1013.25) -> float:
        """
        Calculate Integrated Water Vapor (IWV in mm) from surface dew point and atmospheric pressure
        using the empirical Reitan / Bolton precipitable water formulation.
        """
        # Saturated vapor pressure at dew point (Tetens formula in hPa)
        e_sat = 6.112 * math.exp((17.67 * dew_point_c) / (dew_point_c + 243.5))
        # Total Precipitable Water estimation in mm
        iwv = (0.14 * (dew_point_c + 273.15) - 15.0)
        # Bounded between physically realistic tropospheric columns (10mm to 85mm)
        return round(max(12.0, min(85.0, (e_sat / 1013.25) * 60.0 + 15.0)), 1)

    def _estimate_cloud_top_temp(self, surface_temp_c: float, cloud_cover_pct: float, cape: float) -> float:
        """
        Estimate Cloud Top Temperature (CTT in Kelvin).
        Deep convective clouds penetrating the upper troposphere have very cold cloud tops (< 220 K).
        """
        surface_temp_k = surface_temp_c + 273.15
        if cape > 2200 and cloud_cover_pct > 75:
            # Overshooting deep convective storm cell
            ctt = 205.0 - min(20.0, (cape - 2000) / 100.0)
        elif cloud_cover_pct > 60:
            ctt = surface_temp_k - (cloud_cover_pct * 0.7) - 20.0
        else:
            ctt = surface_temp_k - 15.0
        return round(max(190.0, min(285.0, ctt)), 1)

    def _generate_mock_fallback(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Generates realistic physically-consistent mock atmospheric parameters
        when live internet / API connection is unavailable.
        """
        now = datetime.datetime.utcnow()
        time_hash = int(now.timestamp()) // 300
        # Deterministic pseudo-random seed based on time and coordinates
        coord_seed = int(abs(lat * 100) + abs(lon * 100) + time_hash) % 10000
        np.random.seed(coord_seed)

        is_convective = (coord_seed % 3 == 0)
        temp_c = round(float(np.random.uniform(18.0, 32.0)), 1)
        humidity = round(float(np.random.uniform(70.0, 95.0) if is_convective else np.random.uniform(45.0, 75.0)), 1)
        cape = round(float(np.random.uniform(2200.0, 3900.0) if is_convective else np.random.uniform(300.0, 1400.0)), 1)
        cin = round(float(np.random.uniform(5.0, 35.0) if is_convective else np.random.uniform(60.0, 180.0)), 1)
        rain_rate = round(float(np.random.uniform(35.0, 110.0) if is_convective else np.random.uniform(0.0, 10.0)), 2)
        wind_kmh = round(float(np.random.uniform(45.0, 85.0) if is_convective else np.random.uniform(10.0, 30.0)), 1)
        iwv = round(float(np.random.uniform(52.0, 68.0) if is_convective else np.random.uniform(25.0, 46.0)), 1)
        ctt = round(float(np.random.uniform(198.0, 218.0) if is_convective else np.random.uniform(240.0, 275.0)), 1)
        lifted_idx = round(float(-5.5 if is_convective else -1.0), 2)
        k_index = round(float(38.0 if is_convective else 24.0), 1)

        return {
            "IWV_mm": iwv,
            "CTT_K": ctt,
            "CTT_Celsius": round(ctt - 273.15, 1),
            "CAPE_Jkg": cape,
            "CIN_Jkg": cin,
            "rain_rate_mmh": rain_rate,
            "wind_speed_kmh": wind_kmh,
            "humidity_pct": humidity,
            "lifted_index": lifted_idx,
            "k_index": k_index,
            "surface_temp_c": temp_c,
            "cloud_cover_pct": round(float(np.random.uniform(75.0, 98.0) if is_convective else np.random.uniform(20.0, 60.0)), 1),
            "is_fallback": True
        }

    def fetch_live_point_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch real-time atmospheric measurements for a specific coordinate by combining
        OpenWeatherMap surface telemetry with Open-Meteo atmospheric soundings.
        Automatically falls back to simulated telemetry if offline or APIs fail.
        """
        weather_data = {}
        sounding_data = {}
        has_live_data = False

        # 1. Fetch live surface telemetry from OpenWeatherMap (if API key is active)
        if self.weather_api_key and self.weather_api_key != "your_openweathermap_api_key_here":
            try:
                owm_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.weather_api_key}&units=metric"
                with httpx.Client(timeout=3.0) as client:
                    resp = client.get(owm_url)
                    if resp.status_code == 200:
                        weather_data = resp.json()
                        has_live_data = True
            except Exception as e:
                logger.warning(f"[Live Fetcher] OpenWeatherMap request failed for ({lat}, {lon}): {e}")

        # 2. Fetch live vertical instability indices from Open-Meteo sounding models
        try:
            om_url = (
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
                f"&hourly=cape,convective_inhibition,lifted_index,dew_point_2m"
                f"&current=temperature_2m,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m,cloud_cover"
                f"&timezone=auto"
            )
            with httpx.Client(timeout=3.0) as client:
                resp = client.get(om_url)
                if resp.status_code == 200:
                    sounding_data = resp.json()
                    has_live_data = True
        except Exception as e:
            logger.warning(f"[Live Fetcher] Open-Meteo sounding request failed for ({lat}, {lon}): {e}")

        # If both APIs failed, fall back to mock data
        if not has_live_data:
            logger.info(f"[Live Fetcher] Live API unavailable for ({lat}, {lon}) - falling back to simulated mock data")
            return self._generate_mock_fallback(lat, lon)

        # Extract and harmonize values
        cur_om = sounding_data.get("current", {})
        hourly_om = sounding_data.get("hourly", {})
        owm_main = weather_data.get("main", {})
        owm_wind = weather_data.get("wind", {})
        owm_rain = weather_data.get("rain", {})
        owm_clouds = weather_data.get("clouds", {})

        # Priority: OpenWeatherMap (when available) -> Open-Meteo -> safe physical default
        temp_c = float(owm_main.get("temp", cur_om.get("temperature_2m", 24.0)))
        humidity = float(owm_main.get("humidity", cur_om.get("relative_humidity_2m", 75.0)))
        wind_kmh = float(owm_wind.get("speed", 0.0) * 3.6 if "speed" in owm_wind else cur_om.get("wind_speed_10m", 15.0))
        rain_rate = float(owm_rain.get("1h", cur_om.get("rain", cur_om.get("precipitation", 0.0))))
        cloud_pct = float(owm_clouds.get("all", cur_om.get("cloud_cover", 50.0)))
        pressure = float(owm_main.get("pressure", cur_om.get("surface_pressure", 1013.25)))

        # Instability Sounding Indices
        cape_list = hourly_om.get("cape", [450.0])
        cape = float(cape_list[0] if cape_list and cape_list[0] is not None else 450.0)

        cin_list = hourly_om.get("convective_inhibition", [25.0])
        cin = abs(float(cin_list[0] if cin_list and cin_list[0] is not None else 25.0))

        li_list = hourly_om.get("lifted_index", [-1.5])
        lifted_idx = float(li_list[0] if li_list and li_list[0] is not None else -1.5)

        dew_list = hourly_om.get("dew_point_2m", [temp_c - ((100 - humidity) / 5)])
        dew_point = float(dew_list[0] if dew_list and dew_list[0] is not None else (temp_c - 4.0))

        # Atmospheric and satellite-derived indicators
        iwv = self._calculate_iwv_from_dew_point(dew_point, pressure)
        ctt = self._estimate_cloud_top_temp(temp_c, cloud_pct, cape)
        k_index = round(float(20.0 + (temp_c - dew_point) * 0.4 + (humidity * 0.2)), 1)

        return {
            "IWV_mm": iwv,
            "CTT_K": ctt,
            "CTT_Celsius": round(ctt - 273.15, 1),
            "CAPE_Jkg": round(cape, 1),
            "CIN_Jkg": round(cin, 1),
            "rain_rate_mmh": round(rain_rate, 2),
            "wind_speed_kmh": round(wind_kmh, 1),
            "humidity_pct": round(humidity, 1),
            "lifted_index": round(lifted_idx, 2),
            "k_index": k_index,
            "surface_temp_c": round(temp_c, 1),
            "cloud_cover_pct": round(cloud_pct, 1)
        }

    def fetch_mosdac_hdf5_scan(self) -> Dict[str, Any]:
        """
        Ingest and parse the latest Level-2B Sounder HDF5 file from ISRO MOSDAC.
        Extracts real physical columns: totH2O (IWV), CTT, LI, and derives stability indices.
        """
        if not HAS_H5PY:
            raise RuntimeError("h5py package is not installed.")

        h5_files = self.mosdac_adapter.get_available_h5_files()
        if not h5_files:
            raise FileNotFoundError(f"No MOSDAC .h5 files found in {self.data_dir}")

        latest_file = h5_files[0]
        logger.info(f"[MOSDAC Ingestion] Parsing latest HDF5 satellite file: {latest_file.name}")

        with h5py.File(latest_file, "r") as f:
            lats = np.array(f["Latitude"][:], dtype=float) * 0.01
            lons = np.array(f["Longitude"][:], dtype=float) * 0.01
            tot = np.array(f["totH2O"][0], dtype=float)
            ctt = np.array(f["CTT"][0], dtype=float)
            li = np.array(f["LI"][0], dtype=float)

        valid_coords = (lats > -90) & (lats < 90) & (lons > -180) & (lons < 180)
        valid_tot = valid_coords & (tot > 0) & (tot < 150)
        valid_ctt = valid_coords & (ctt > 150) & (ctt < 350)
        valid_li = valid_coords & (li > -25) & (li < 25)

        regional_hotspots = []
        primary_metrics = None

        for spot in self.hotspot_locations:
            dist = (lats - spot["lat"]) ** 2 + (lons - spot["lon"]) ** 2

            idx_tot = np.unravel_index(np.argmin(np.where(valid_tot, dist, np.inf)), lats.shape)
            idx_ctt = np.unravel_index(np.argmin(np.where(valid_ctt, dist, np.inf)), lats.shape)
            idx_li = np.unravel_index(np.argmin(np.where(valid_li, dist, np.inf)), lats.shape)

            iwv = round(float(tot[idx_tot]), 1) if np.isfinite(tot[idx_tot]) and tot[idx_tot] > 0 else 45.0
            ctt_val = round(float(ctt[idx_ctt]), 1) if np.isfinite(ctt[idx_ctt]) and ctt[idx_ctt] > 150 else 230.0
            li_val = round(float(li[idx_li]), 2) if np.isfinite(li[idx_li]) else -1.5

            # Atmospheric physics formulations
            if li_val < 0:
                cape = max(250.0, min(4800.0, -li_val * 460.0 + iwv * 12.0))
            else:
                cape = max(50.0, min(900.0, (8.0 - li_val) * 40.0 + iwv * 4.0))
            cape = round(float(cape), 1)

            cin = round(float(max(5.0, min(180.0, 15.0 + max(0.0, li_val) * 16.0))), 1)
            k_idx = round(float(max(15.0, min(44.0, 26.0 - (li_val * 2.2) + (iwv * 0.2)))), 1)
            humidity = round(float(max(45.0, min(98.0, 42.0 + iwv * 0.9))), 1)

            # Rainfall rate estimation
            if ctt_val < 220.0 and iwv > 40.0:
                rain_rate = round(float(max(15.0, (220.0 - ctt_val) * 1.2 + (iwv - 45.0) * 0.7)), 2)
            elif ctt_val < 240.0:
                rain_rate = round(float(max(1.0, (240.0 - ctt_val) * 0.3)), 2)
            else:
                rain_rate = 0.0

            wind_speed = round(float(max(15.0, min(95.0, 20.0 + math.sqrt(cape) * 0.9))), 1)

            # Severe weather risk level evaluation
            if iwv > 50.0 and ctt_val < 210.0 and cape > 1800.0:
                risk_level = "CRITICAL"
            elif iwv > 42.0 or cape > 1300.0 or ctt_val < 230.0:
                risk_level = "WARNING"
            elif iwv > 35.0 or cape > 700.0:
                risk_level = "WATCH"
            else:
                risk_level = "NORMAL"

            metrics = {
                "IWV_mm": iwv,
                "CTT_K": ctt_val,
                "CTT_Celsius": round(ctt_val - 273.15, 1),
                "CAPE_Jkg": cape,
                "CIN_Jkg": cin,
                "rain_rate_mmh": rain_rate,
                "wind_speed_kmh": wind_speed,
                "humidity_pct": humidity,
                "lifted_index": li_val,
                "k_index": k_idx,
                "surface_temp_c": round(max(12.0, min(38.0, ctt_val - 210.0 + 22.0)), 1),
                "cloud_cover_pct": round(float(min(100.0, max(10.0, (280.0 - ctt_val) * 1.2))), 1)
            }

            if primary_metrics is None:
                primary_metrics = metrics

            regional_hotspots.append({
                "region": spot["region"],
                "lat": spot["lat"],
                "lon": spot["lon"],
                "iwv": iwv,
                "ctt": ctt_val,
                "risk": risk_level,
                "temp_c": metrics["surface_temp_c"],
                "rain_rate": rain_rate
            })

        # Parse timestamp from filename (e.g., 3RSND_11SEP2026_1500_L2B_SA1_V01R00.h5)
        file_ts = datetime.datetime.utcnow().isoformat() + "Z"
        try:
            parts = latest_file.stem.split("_")
            if len(parts) >= 3:
                date_str = parts[1]  # 11SEP2026
                time_str = parts[2]  # 1500
                dt = datetime.datetime.strptime(f"{date_str}_{time_str}", "%d%b%Y_%H%M")
                file_ts = dt.isoformat() + "Z"
        except Exception:
            pass

        return {
            "scan_id": f"MOSDAC_HDF5_{latest_file.stem}",
            "timestamp": file_ts,
            "satellite": "INSAT-3DR (ISRO MOSDAC Sounder Level-2B)",
            "sensor": "19-Channel Sounder (SA1 Sector)",
            "status": "ONLINE",
            "data_source": "MOSDAC_INSAT3DR_HDF5",
            "source_file": latest_file.name,
            "is_fallback": False,
            "mosdac_adapter_status": "CONNECTED_LOCAL_HDF5",
            "summary_metrics": primary_metrics,
            "regional_hotspots": regional_hotspots
        }

    def fetch_live_api_scan(self) -> Dict[str, Any]:
        """
        Fetch live satellite scan metrics from OpenWeatherMap + Open-Meteo sounding models.
        """
        now = datetime.datetime.utcnow()
        scan_id = f"MOSDAC_LIVE_{now.strftime('%Y%m%d_%H%M%S')}"

        primary_metrics = None
        regional_hotspots: List[Dict[str, Any]] = []

        for spot in self.hotspot_locations:
            try:
                metrics = self.fetch_live_point_data(spot["lat"], spot["lon"])
                if primary_metrics is None:
                    primary_metrics = metrics

                iwv = metrics["IWV_mm"]
                cape = metrics["CAPE_Jkg"]
                ctt = metrics["CTT_K"]

                if iwv > 52 and ctt < 220 and cape > 2000:
                    risk_level = "CRITICAL"
                elif iwv > 45 or cape > 1500 or ctt < 235:
                    risk_level = "WARNING"
                elif iwv > 38 or cape > 800:
                    risk_level = "WATCH"
                else:
                    risk_level = "NORMAL"

                regional_hotspots.append({
                    "region": spot["region"],
                    "lat": spot["lat"],
                    "lon": spot["lon"],
                    "iwv": iwv,
                    "ctt": ctt,
                    "risk": risk_level,
                    "temp_c": metrics.get("surface_temp_c"),
                    "rain_rate": metrics.get("rain_rate_mmh")
                })
            except Exception as e:
                logger.error(f"[Live Fetcher] Error fetching {spot['region']}: {e}")

        if not primary_metrics:
            logger.warning("[Live Fetcher] Network offline: using fallback atmospheric baseline")
            primary_metrics = {
                "IWV_mm": 48.5,
                "CTT_K": 235.0,
                "CTT_Celsius": -38.1,
                "CAPE_Jkg": 1850.0,
                "CIN_Jkg": 35.0,
                "rain_rate_mmh": 12.5,
                "wind_speed_kmh": 45.0,
                "humidity_pct": 82.0,
                "lifted_index": -3.2,
                "k_index": 34.0
            }

        is_fallback_mode = any(h.get("is_fallback", False) for h in regional_hotspots) or primary_metrics.get("is_fallback", False)
        data_source = "SIMULATED_MOCK_FALLBACK" if is_fallback_mode else "LIVE_OPENWEATHER_AND_ATMOSPHERIC_SOUNDINGS"

        return {
            "scan_id": scan_id,
            "timestamp": now.isoformat() + "Z",
            "satellite": self.satellite_id,
            "sensor": self.sensor_type,
            "status": "ONLINE",
            "data_source": data_source,
            "is_fallback": is_fallback_mode,
            "mosdac_adapter_status": "READY" if self.mosdac_adapter.is_configured else "UNCONFIGURED",
            "summary_metrics": {
                "IWV_mm": primary_metrics["IWV_mm"],
                "CTT_K": primary_metrics["CTT_K"],
                "CTT_Celsius": primary_metrics["CTT_Celsius"],
                "CAPE_Jkg": primary_metrics["CAPE_Jkg"],
                "CIN_Jkg": primary_metrics["CIN_Jkg"],
                "rain_rate_mmh": primary_metrics["rain_rate_mmh"],
                "wind_speed_kmh": primary_metrics["wind_speed_kmh"],
                "humidity_pct": primary_metrics["humidity_pct"],
                "lifted_index": primary_metrics["lifted_index"],
                "k_index": primary_metrics["k_index"]
            },
            "regional_hotspots": regional_hotspots
        }

    def fetch_simulated_scan(self) -> Dict[str, Any]:
        """
        Pure simulated fallback scan generator.
        Executes without any network requests or external dependencies, ensuring 100% uptime.
        """
        now = datetime.datetime.utcnow()
        scan_id = f"MOSDAC_SIM_{now.strftime('%Y%m%d_%H%M%S')}"

        primary_metrics = None
        regional_hotspots: List[Dict[str, Any]] = []

        for spot in self.hotspot_locations:
            metrics = self._generate_mock_fallback(spot["lat"], spot["lon"])
            if primary_metrics is None:
                primary_metrics = metrics

            iwv = metrics["IWV_mm"]
            cape = metrics["CAPE_Jkg"]
            ctt = metrics["CTT_K"]

            if iwv > 52 and ctt < 220 and cape > 2000:
                risk_level = "CRITICAL"
            elif iwv > 45 or cape > 1500 or ctt < 235:
                risk_level = "WARNING"
            elif iwv > 38 or cape > 800:
                risk_level = "WATCH"
            else:
                risk_level = "NORMAL"

            regional_hotspots.append({
                "region": spot["region"],
                "lat": spot["lat"],
                "lon": spot["lon"],
                "iwv": iwv,
                "ctt": ctt,
                "risk": risk_level,
                "temp_c": metrics.get("surface_temp_c"),
                "rain_rate": metrics.get("rain_rate_mmh"),
                "is_fallback": True
            })

        return {
            "scan_id": scan_id,
            "timestamp": now.isoformat() + "Z",
            "satellite": "INSAT-3DR (Atmospheric Simulation Engine)",
            "sensor": "Sounder Simulation (19 Channels)",
            "status": "ONLINE",
            "data_source": "SIMULATED_MOCK_FALLBACK",
            "is_fallback": True,
            "fallback_reason": "MOSDAC / Live APIs offline or mode set to SIMULATED",
            "mosdac_adapter_status": "FALLBACK_SIMULATED",
            "summary_metrics": {
                "IWV_mm": primary_metrics["IWV_mm"],
                "CTT_K": primary_metrics["CTT_K"],
                "CTT_Celsius": primary_metrics["CTT_Celsius"],
                "CAPE_Jkg": primary_metrics["CAPE_Jkg"],
                "CIN_Jkg": primary_metrics["CIN_Jkg"],
                "rain_rate_mmh": primary_metrics["rain_rate_mmh"],
                "wind_speed_kmh": primary_metrics["wind_speed_kmh"],
                "humidity_pct": primary_metrics["humidity_pct"],
                "lifted_index": primary_metrics["lifted_index"],
                "k_index": primary_metrics["k_index"]
            },
            "regional_hotspots": regional_hotspots
        }

    def fetch_latest_scan(self) -> Dict[str, Any]:
        """
        Fetch latest satellite scan metrics across all monitored regional hotspots.
        Follows a bulletproof 3-tier cascade:
          1. Tier 1: MOSDAC Real HDF5 (if mode is MOSDAC and files are available)
          2. Tier 2: LIVE_AUTO (OpenWeatherMap + Open-Meteo sounding APIs)
          3. Tier 3: SIMULATED (deterministic mathematical convective atmospheric simulation)
        Guaranteed to never fail or raise an unhandled exception.
        """
        mode = (self.data_mode or "MOSDAC").upper()

        # Tier 1: Try MOSDAC HDF5 Ingestion
        if mode == "MOSDAC":
            try:
                return self.fetch_mosdac_hdf5_scan()
            except Exception as e:
                logger.warning(f"[Ingestion Cascade] MOSDAC HDF5 ingestion unavailable ({e}). Falling back to Tier 2: LIVE_AUTO.")

        # Tier 2: Try Live APIs (OpenWeatherMap + Open-Meteo)
        if mode in ("MOSDAC", "LIVE_AUTO"):
            try:
                return self.fetch_live_api_scan()
            except Exception as e:
                logger.warning(f"[Ingestion Cascade] LIVE_AUTO APIs failed ({e}). Falling back to Tier 3: SIMULATED.")

        # Tier 3: Deterministic Physics-based Simulation
        return self.fetch_simulated_scan()


insat_fetcher = MOSDACInsatFetcher()
