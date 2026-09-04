"""
SANKET FastAPI Backend Service
Exposes REST API endpoints for severe weather predictions, geospatial overlays,
SHAP explainability, and alert feeds.
"""
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from ml.predictor import predictor
from backend.mock_data import (
    get_current_risk_zones,
    get_critical_assets,
    get_weather_grid_overlay,
    get_historical_events,
    get_recent_alerts
)

app = FastAPI(
    title="SANKET Weather Nowcasting REST API",
    description=(
        "AI-Driven Severe Weather Early Warning API powered by XGBoost"
    ),
    version="1.0.0"
)

# Enable CORS for Streamlit frontend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WeatherFeaturesInput(BaseModel):
    """Input Pydantic Model for Weather Feature Predictions."""

    iwv_accumulation_rate: float = Field(
        ..., example=8.2,
        description="Integrated Water Vapor accumulation rate (kg/m²/hr)"
    )
    ctt_drop_rate: float = Field(
        ..., example=16.5,
        description="Cloud Top Temperature drop rate (°C/hr)"
    )
    cape: float = Field(
        ..., example=3150.0,
        description="Convective Available Potential Energy (J/kg)"
    )
    cin: float = Field(
        ..., example=12.0,
        description="Convective Inhibition (J/kg)"
    )
    wind_shear_0_6km: float = Field(
        ..., example=24.2,
        description="0-6km vertical wind shear (m/s)"
    )
    relative_humidity_850: float = Field(
        ..., example=92.0,
        description="850hPa relative humidity (%)"
    )
    pressure_drop_3h: float = Field(
        ..., example=4.5,
        description="3-hour surface pressure drop (hPa)"
    )


@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "system": "SANKET Severe Weather Early Warning System",
        "status": "ONLINE",
        "api_docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/v1/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "HEALTHY",
        "model_loaded": predictor.is_trained,
        "engine": "XGBoost Engine"
    }


@app.post("/api/v1/predict")
def predict_nowcast(input_data: WeatherFeaturesInput):
    """Computes XGBoost nowcasts & SHAP feature contributions."""
    try:
        features = input_data.model_dump()
        result = predictor.predict_nowcast(features)
        return {
            "status": "SUCCESS",
            "prediction": result,
            "input_features": features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/api/v1/risk-zones")
def get_risk_zones():
    """Returns GeoJSON FeatureCollection of severe weather risk zones."""
    return get_current_risk_zones()


@app.get("/api/v1/assets")
def get_assets(category: Optional[str] = None):
    """Returns catalog of monitored infrastructure assets."""
    assets = get_critical_assets()
    if category:
        assets = [
            a for a in assets
            if a["category"].lower() == category.lower()
        ]
    return {"status": "SUCCESS", "count": len(assets), "assets": assets}


@app.get("/api/v1/weather-grid")
def get_weather_grid():
    """Returns atmospheric metric grid overlay points (IWV, CAPE, CTT drop)."""
    grid = get_weather_grid_overlay()
    return {"status": "SUCCESS", "points_count": len(grid), "grid": grid}


@app.get("/api/v1/historical-events")
def get_events(event_id: Optional[str] = None):
    """Returns historical severe weather timeline replay dataset."""
    events = get_historical_events()
    if event_id:
        if event_id in events:
            return {"status": "SUCCESS", "event": events[event_id]}
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "SUCCESS", "events": events}


@app.get("/api/v1/alerts")
def get_alerts():
    """Returns active emergency alert notifications."""
    alerts = get_recent_alerts()
    return {"status": "SUCCESS", "count": len(alerts), "alerts": alerts}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
