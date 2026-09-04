"""
SANKET - Severe Weather Early Warning System Configuration
"""
import os

# Application Settings
APP_NAME = "SANKET"
APP_TAGLINE = "AI-Driven Hyper-Local Severe Weather Nowcasting System"
VERSION = "1.0.0"

# API Settings
FASTAPI_DEFAULT_URL = "http://localhost:8000"
API_BASE_URL = os.getenv("SANKET_API_URL", FASTAPI_DEFAULT_URL)
API_TIMEOUT = 5  # seconds
MAX_RETRIES = 3

# Map Settings (Default Center: India / Western Ghats / Mumbai Region)
MAP_DEFAULT_CENTER = [19.0760, 72.8777]  # Mumbai region lat/lon
MAP_DEFAULT_ZOOM = 9
PAN_INDIA_CENTER = [20.5937, 78.9629]
PAN_INDIA_ZOOM = 5

# Risk Categories & Color Palette
RISK_COLORS = {
    "HIGH": "#EF4444",      # Vivid Red
    "MODERATE": "#F97316",  # Vibrant Orange
    "LOW": "#F59E0B",       # Warm Yellow
    "SAFE": "#10B981"       # Emerald Green
}

# Probability Thresholds (%)
THRESHOLD_HIGH = 85.0
THRESHOLD_MODERATE = 60.0
THRESHOLD_LOW = 35.0

# Alert Levels & Recommended Actions
ALERT_PLAYBOOKS = {
    "RED": {
        "title": "CRITICAL EMERGENCY - RED ALERT",
        "badge_color": "#EF4444",
        "description": "Explosive storm cloud growth and extreme rainfall rate detected. Severe risk of cloudburst & flash flooding within 2-4 hours.",
        "actions": [
            "Issue immediate public evacuation warning for low-lying coastal & riverbank areas.",
            "Halt all construction site crane & high-elevation operations.",
            "Deploy emergency high-capacity dewatering pumps at critical substations.",
            "Reroute road traffic away from known underpass flood hotspots.",
            "Notify emergency response teams (NDRF / Disaster Management Units)."
        ]
    },
    "ORANGE": {
        "title": "HIGH VIGILANCE - ORANGE ALERT",
        "badge_color": "#F97316",
        "description": "Rapid CTT drop and high moisture convergence observed. Moderate to high risk of thunderstorm & localized flooding in 3-6 hours.",
        "actions": [
            "Place municipal response crews on 15-minute standby.",
            "Inspect and clear storm-water drain grates at major junctions.",
            "Alert power distribution utilities to monitor transformer load & lightning arresters.",
            "Advise outdoor workers to seek shelter upon thunder auditory signals."
        ]
    },
    "YELLOW": {
        "title": "ADVISORY - YELLOW ALERT",
        "badge_color": "#F59E0B",
        "description": "Atmospheric instability rising with elevated CAPE. Low to moderate nowcast threat level.",
        "actions": [
            "Monitor satellite IWV and local radar feeds continuously.",
            "Verify backup generator readiness at telecom towers & hospitals.",
            "Issue routine weather advisory updates to civic agencies."
        ]
    },
    "GREEN": {
        "title": "NORMAL CONDITIONS - GREEN ALERT",
        "badge_color": "#10B981",
        "description": "Atmosphere stable. Moisture loading and cloud top temp drop within seasonal baseline parameters.",
        "actions": [
            "Standard monitoring in progress.",
            "No special emergency protocols required."
        ]
    }
}

# Weather Metric Definitions & Thresholds
METRIC_UNITS = {
    "IWV": "kg/m²",           # Integrated Water Vapor
    "IWV_RATE": "kg/m²/hr",   # IWV accumulation rate
    "CAPE": "J/kg",           # Convective Available Potential Energy
    "CIN": "J/kg",            # Convective Inhibition
    "CTT_DROP": "°C/hr",      # Cloud Top Temperature drop rate
    "RAINFALL": "mm/hr",      # Predicted rainfall intensity
    "WIND_SHEAR": "m/s",      # Vertical wind shear (0-6km)
    "CONFIDENCE": "%"         # Model Nowcast Confidence Score
}

# Feature Plain English Translations for SHAP Explainability
FEATURE_TRANSLATIONS = {
    "iwv_accumulation_rate": {
        "name": "IWV Accumulation Rate",
        "high": "Abundant moisture loading rapidly converging in the lower atmosphere",
        "low": "Low moisture convergence rate present",
        "unit": "kg/m²/hr"
    },
    "ctt_drop_rate": {
        "name": "Cloud Top Temp Drop Rate",
        "high": "Explosive convective storm cloud vertical growth and deep updrafts",
        "low": "Gradual or stable cloud top cooling rate",
        "unit": "°C/hr"
    },
    "cape": {
        "name": "Convective Available Potential Energy (CAPE)",
        "high": "Extreme atmospheric instability providing strong thermodynamic energy",
        "low": "Weak buoyancy energy available for updrafts",
        "unit": "J/kg"
    },
    "cin": {
        "name": "Convective Inhibition (CIN)",
        "high": "Strong convective capping layer preventing early energy release",
        "low": "Weak capping barrier allowing immediate explosive convection",
        "unit": "J/kg"
    },
    "wind_shear_0_6km": {
        "name": "0-6km Vertical Wind Shear",
        "high": "Strong shear supporting storm organization and long-lived supercell formation",
        "low": "Weak shear favoring brief single-cell pulse storms",
        "unit": "m/s"
    },
    "relative_humidity_850": {
        "name": "850hPa Relative Humidity",
        "high": "Nearly saturated lower atmosphere sustaining precipitation efficiency",
        "low": "Drier lower levels causing virga or evaporative cooling",
        "unit": "%"
    },
    "pressure_drop_3h": {
        "name": "3-Hour Surface Pressure Drop",
        "high": "Sharp mesoscale barometric pressure drop signaling storm approach",
        "low": "Stable atmospheric pressure gradient",
        "unit": "hPa"
    }
}
