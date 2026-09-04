"""
SANKET Data Connection Layer
Handles REST API communication with FastAPI backend, exponential retries,
response caching, and offline fallback to synthetic data generators.
"""
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import pandas as pd
import streamlit as st
import config
from ml.predictor import predictor
from backend.mock_data import (
    get_current_risk_zones,
    get_critical_assets,
    get_weather_grid_overlay,
    get_historical_events,
    get_recent_alerts
)


class DataConnectionManager:
    """Manages resilient data retrieval from REST backend or offline engine."""

    def __init__(self, base_url: str = config.API_BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.session = self._create_retry_session()

    def _create_retry_session(self) -> requests.Session:
        """Creates a requests session configured with exponential retries."""
        session = requests.Session()
        retry_strategy = Retry(
            total=config.MAX_RETRIES,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    def check_backend_connection(self) -> tuple[bool, str]:
        """Checks if the FastAPI backend is alive and reachable."""
        try:
            res = self.session.get(
                f"{self.base_url}/api/v1/health", timeout=1.5
            )
            if res.status_code == 200:
                return True, f"Connected to FastAPI Backend ({self.base_url})"
            return False, f"Backend returned status {res.status_code}"
        except requests.RequestException as err:
            return (
                False,
                f"Backend offline ({err}). High-Fidelity Offline Mode active."
            )

    def get_prediction(
        self, features: dict, force_offline: bool = False
    ) -> dict:
        """Fetches XGBoost predictions via REST API or local engine."""
        if not force_offline:
            try:
                res = self.session.post(
                    f"{self.base_url}/api/v1/predict",
                    json=features,
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("prediction", {})
            except requests.RequestException:
                pass

        return predictor.predict_nowcast(features)

    def get_risk_zones(self, force_offline: bool = False) -> dict:
        """Fetches GeoJSON risk zone polygons."""
        if not force_offline:
            try:
                res = self.session.get(
                    f"{self.base_url}/api/v1/risk-zones",
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    return res.json()
            except requests.RequestException:
                pass
        return get_current_risk_zones()

    def get_assets(self, force_offline: bool = False) -> list:
        """Fetches monitored critical infrastructure assets list."""
        if not force_offline:
            try:
                res = self.session.get(
                    f"{self.base_url}/api/v1/assets",
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    return res.json().get("assets", [])
            except requests.RequestException:
                pass
        return get_critical_assets()

    def get_weather_grid(self, force_offline: bool = False) -> list:
        """Fetches weather grid overlay points."""
        if not force_offline:
            try:
                res = self.session.get(
                    f"{self.base_url}/api/v1/weather-grid",
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    return res.json().get("grid", [])
            except requests.RequestException:
                pass
        return get_weather_grid_overlay()

    def get_live_prediction(
        self,
        latitude: float = 19.076,
        longitude: float = 72.8777,
        location: str = "Mumbai",
        force_offline: bool = False
    ) -> dict:
        """
        Fetches live Open-Meteo weather predictions via REST backend or local
        ML engine.
        """
        if not force_offline:
            try:
                res = self.session.get(
                    f"{self.base_url}/live-predict",
                    params={
                        "latitude": latitude,
                        "longitude": longitude,
                        "location": location
                    },
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    return res.json()
            except requests.RequestException:
                pass

        # Offline Direct Open-Meteo or Local Predictor
        try:
            url = "https://api.open-meteo.com/v1/forecast"
            curr_str = (
                "temperature_2m,relative_humidity_2m,wind_speed_10m,"
                "precipitation,cape,convective_inhibition"
            )
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": curr_str,
                "timezone": "Asia/Kolkata"
            }
            res = requests.get(url, params=params, timeout=3)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                weather_df = pd.DataFrame([{
                    "temperature_2m": current.get("temperature_2m", 30.0),
                    "relative_humidity_2m": current.get(
                        "relative_humidity_2m", 80.0
                    ),
                    "wind_speed_10m": current.get("wind_speed_10m", 15.0),
                    "precipitation": current.get("precipitation", 0.0),
                    "cape": current.get("cape", 1200.0),
                    "convective_inhibition": current.get(
                        "convective_inhibition", 20.0
                    )
                }])
                return predictor.predict_live_weather(
                    weather_df,
                    location=location,
                    timestamp=current.get("time")
                )
        except (requests.RequestException, ValueError, KeyError):
            pass

        fallback_df = pd.DataFrame([{
            "temperature_2m": 31.5,
            "relative_humidity_2m": 88.0,
            "wind_speed_10m": 22.0,
            "precipitation": 14.5,
            "cape": 2450.0,
            "convective_inhibition": 15.0
        }])
        return predictor.predict_live_weather(fallback_df, location=location)

    def get_historical_events(self, force_offline: bool = False) -> dict:
        """Fetches historical severe weather replay dataset."""
        if not force_offline:
            try:
                res = self.session.get(
                    f"{self.base_url}/api/v1/historical-events",
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    return res.json().get("events", {})
            except requests.RequestException:
                pass
        return get_historical_events()

    def get_alerts(self, force_offline: bool = False) -> list:
        """Fetches active emergency alert feed."""
        if not force_offline:
            try:
                res = self.session.get(
                    f"{self.base_url}/api/v1/alerts",
                    timeout=config.API_TIMEOUT
                )
                if res.status_code == 200:
                    return res.json().get("alerts", [])
            except requests.RequestException:
                pass
        return get_recent_alerts()


# Global Singleton Data Manager
data_manager = DataConnectionManager()


# Streamlit Cached Wrapper Functions
@st.cache_data(ttl=15)
def cached_fetch_live_prediction(
    latitude: float = 19.076,
    longitude: float = 72.8777,
    location: str = "Mumbai",
    force_offline: bool = False
):
    """Cached wrapper for fetching live weather prediction."""
    return data_manager.get_live_prediction(
        latitude=latitude,
        longitude=longitude,
        location=location,
        force_offline=force_offline
    )


@st.cache_data(ttl=15)
def cached_fetch_risk_zones(force_offline: bool = False):
    """Cached wrapper for fetching risk zone polygons."""
    return data_manager.get_risk_zones(force_offline=force_offline)


@st.cache_data(ttl=15)
def cached_fetch_assets(force_offline: bool = False):
    """Cached wrapper for fetching critical assets inventory."""
    return data_manager.get_assets(force_offline=force_offline)


@st.cache_data(ttl=30)
def cached_fetch_weather_grid(force_offline: bool = False):
    """Cached wrapper for fetching atmospheric weather grid points."""
    return data_manager.get_weather_grid(force_offline=force_offline)


@st.cache_data(ttl=60)
def cached_fetch_historical_events(force_offline: bool = False):
    """Cached wrapper for fetching historical event replay data."""
    return data_manager.get_historical_events(force_offline=force_offline)
