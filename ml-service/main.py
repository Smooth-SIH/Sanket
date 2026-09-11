"""
FastAPI REST Service for SANKET ML Nowcasting Engine.
"""

from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import nowcast_model
from shap_engine import shap_engine
from insat_fetcher import insat_fetcher

app = FastAPI(
    title="SANKET ML Nowcasting Microservice",
    description="XGBoost & SHAP Severe Weather Nowcasting Engine for SIH 2026",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NowcastRequest(BaseModel):
    """Pydantic model for weather parameter inputs."""
    IWV_mm: Optional[float] = 58.4
    CTT_K: Optional[float] = 208.5
    CAPE_Jkg: Optional[float] = 3200.0
    CIN_Jkg: Optional[float] = 12.0
    wind_speed_kmh: Optional[float] = 65.0
    humidity_pct: Optional[float] = 92.0
    rain_rate_mmh: Optional[float] = 55.0
    lifted_index: Optional[float] = -5.5
    k_index: Optional[float] = 39.0


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    """Service root endpoint."""
    return {
        "system": "SANKET Severe Weather Nowcast Engine",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "models_loaded": ["XGBoost-Cloudburst-V2", "SHAP-TreeExplainer"]
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "HEALTHY", "service": "sanket-ml-service"}


@app.post("/predict/nowcast")
def predict_nowcast(req: NowcastRequest):
    """Predict severe weather nowcast and generate SHAP explanations."""
    try:
        features = req.model_dump()
        prediction = nowcast_model.predict(features)
        shap_summary = shap_engine.explain_instance(features)
        prediction['shap_explanation'] = shap_summary
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/predict/shap")
def explain_nowcast(req: NowcastRequest):
    """Generate SHAP feature attributions for given observation."""
    try:
        features = req.model_dump()
        return shap_engine.explain_instance(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/satellite/insat3d/latest")
def get_latest_satellite():
    """Fetch latest INSAT-3D scan and execute nowcast assessment."""
    try:
        scan_data = insat_fetcher.fetch_latest_scan()
        prediction = nowcast_model.predict(scan_data['summary_metrics'])
        scan_data['nowcast_assessment'] = prediction
        return scan_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
