"""
SANKET Data Connection Layer
Handles REST API communication with FastAPI backend, exponential retries, response caching,
and seamless offline fallback to synthetic data generators.
"""
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
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
    """Manages resilient data retrieval from live REST backend or offline synthetic engine."""
    
    def __init__(self, base_url: str = config.API_BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.session = self._create_retry_session()

    def _create_retry_session(self) -> requests.Session:
        """Creates a requests session configured with exponential backoff retries."""
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
            res = self.session.get(f"{self.base_url}/api/v1/health", timeout=1.5)
            if res.status_code == 200:
                return True, f"Connected to FastAPI Backend ({self.base_url})"
            return False, f"Backend returned status {res.status_code}"
        except Exception as e:
            return False, f"Backend offline ({e}). Operating in High-Fidelity Offline Mode."

    def get_prediction(self, features: dict, force_offline: bool = False) -> dict:
        """Fetches XGBoost predictions via REST API or local inference engine."""
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
            except Exception:
                pass  # Fallback to local predictor
                
        # Local Offline Engine
        return predictor.predict_nowcast(features)

    def get_risk_zones(self, force_offline: bool = False) -> dict:
        """Fetches GeoJSON risk zone polygons."""
        if not force_offline:
            try:
                res = self.session.get(f"{self.base_url}/api/v1/risk-zones", timeout=config.API_TIMEOUT)
                if res.status_code == 200:
                    return res.json()
            except Exception:
                pass
        return get_current_risk_zones()

    def get_assets(self, force_offline: bool = False) -> list:
        """Fetches monitored critical infrastructure assets list."""
        if not force_offline:
            try:
                res = self.session.get(f"{self.base_url}/api/v1/assets", timeout=config.API_TIMEOUT)
                if res.status_code == 200:
                    return res.json().get("assets", [])
            except Exception:
                pass
        return get_critical_assets()

    def get_weather_grid(self, force_offline: bool = False) -> list:
        """Fetches weather grid overlay points."""
        if not force_offline:
            try:
                res = self.session.get(f"{self.base_url}/api/v1/weather-grid", timeout=config.API_TIMEOUT)
                if res.status_code == 200:
                    return res.json().get("grid", [])
            except Exception:
                pass
        return get_weather_grid_overlay()

    def get_historical_events(self, force_offline: bool = False) -> dict:
        """Fetches historical severe weather replay dataset."""
        if not force_offline:
            try:
                res = self.session.get(f"{self.base_url}/api/v1/historical-events", timeout=config.API_TIMEOUT)
                if res.status_code == 200:
                    return res.json().get("events", {})
            except Exception:
                pass
        return get_historical_events()

    def get_alerts(self, force_offline: bool = False) -> list:
        """Fetches active emergency alert feed."""
        if not force_offline:
            try:
                res = self.session.get(f"{self.base_url}/api/v1/alerts", timeout=config.API_TIMEOUT)
                if res.status_code == 200:
                    return res.json().get("alerts", [])
            except Exception:
                pass
        return get_recent_alerts()

# Global Singleton Data Manager
data_manager = DataConnectionManager()

# Streamlit Cached Wrapper Functions
@st.cache_data(ttl=15)
def cached_fetch_risk_zones(force_offline: bool = False):
    return data_manager.get_risk_zones(force_offline=force_offline)

@st.cache_data(ttl=15)
def cached_fetch_assets(force_offline: bool = False):
    return data_manager.get_assets(force_offline=force_offline)

@st.cache_data(ttl=30)
def cached_fetch_weather_grid(force_offline: bool = False):
    return data_manager.get_weather_grid(force_offline=force_offline)

@st.cache_data(ttl=60)
def cached_fetch_historical_events(force_offline: bool = False):
    return data_manager.get_historical_events(force_offline=force_offline)
