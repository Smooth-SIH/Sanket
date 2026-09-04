# ⚡ Sanket: AI-Driven Severe Weather Nowcasting & Early Warning System

**Sanket** is a complete, production-grade severe weather nowcasting application designed to predict **Thunderstorms, Cloudbursts, and Flash Floods 2 to 6 hours in advance** using an **XGBoost machine learning model**, interactive geospatial maps, real-time atmospheric diagnostics, SHAP explainability, emergency alert playbooks, and critical infrastructure vulnerability tracking.

---

## 🌟 Key Features

1. **Geospatial Interactive Risk Map (`Folium` + `streamlit-folium`)**:
   - Color-coded GeoJSON risk zones (**RED: High**, **ORANGE: Moderate**, **YELLOW: Low**, **GREEN: Safe**).
   - Atmospheric layer overlays: Integrated Water Vapor (IWV) heatmaps, CAPE energy circles, Cloud Top Temp (CTT) cooling rate heatmaps, and Digital Elevation Model (DEM) hillshades.
   - Monitored infrastructure asset markers (Power Substations, Construction Sites, Telecom Towers, Flood Hotspots) with custom popups.

2. **Real-Time Risk Dashboard (`Plotly`)**:
   - Risk summary KPI cards & Alert status badges.
   - Real-time atmospheric parameter gauges (IWV rate, CAPE, CTT drop, CIN, Wind shear, Confidence score).
   - 6-Hour nowcast risk trajectory and past precursors convergence trend charts.

3. **Historical Event Replay Simulator**:
   - Interactive timeline slider replaying famous past severe weather disasters (e.g. *Mumbai Floods 2020*, *Uttarakhand Cloudburst 2021*).
   - Automatic Play/Pause playback controls with variable speed multipliers (1x, 2x, 5x).
   - **Then vs Now** AI baseline evaluation comparing ground rain gauge observations vs SANKET XGBoost predictions.

4. **AI Explainability & SHAP Module**:
   - SHAP feature attribution waterfall & horizontal bar charts.
   - Plain-English translations of complex atmospheric features for non-expert disaster control room operators.
   - Model confidence intervals and decision logic rationale.

5. **Emergency Alert Center**:
   - Categorized incident feed with interactive **Alert Acknowledgment** tracking.
   - Standard Operating Procedure (SOP) playbooks for RED, ORANGE, YELLOW, and GREEN alerts.
   - Alert count and severity distribution analytics.

6. **Infrastructure Asset Vulnerability Tracker**:
   - Monitored assets catalog with vulnerability index, estimated flood depths, elevation ASL, and customized action advice.
   - Filter assets by category, severity level, or text search.
   - **Export CSV** asset risk reporting.

7. **Resilient Data Layer & FastAPI Backend**:
   - Live REST API client connecting to FastAPI backend (`http://localhost:8000`).
   - Built-in High-Fidelity **Offline Demo Fallback Mode** so the app runs stand-alone without requiring an external server.

---

## 🏗️ Technical Architecture

```text
Sanket/
├── app.py                     # Main Streamlit UI Entry Point
├── config.py                  # Thresholds, colors, alert playbooks & plain-English dictionary
├── components/                # UI & Business Logic Components
│   ├── data_layer.py          # REST API manager, exponential retries & st.cache_data
│   ├── map_component.py       # Interactive Folium map with weather overlays & DEM hillshade
│   ├── dashboard_component.py # Risk KPI Cards & Plotly trend visualizations
│   ├── replay_component.py    # Historical event timeline player (T-6h to T=0) & Then vs Now
│   ├── explainability.py      # SHAP feature importance & plain-English translations
│   ├── alert_center.py        # Emergency alerts feed, playbooks & acknowledgment workflow
│   └── asset_monitor.py       # Infrastructure asset vulnerability tracking & CSV export
├── backend/                   # FastAPI REST API Server
│   ├── main.py                # FastAPI endpoints (/predict, /risk-zones, /explainability)
│   └── mock_data.py           # Geospatial GeoJSON, weather grids & event dataset generators
├── ml/                        # Machine Learning Model Engine
│   ├── predictor.py           # XGBoost inference wrapper & SHAP explainer computation
│   └── trainer.py             # Synthetic training dataset & XGBoost model factory
├── .streamlit/
│   └── config.toml            # Custom dark theme configuration
├── Dockerfile                 # Frontend Streamlit Docker image build
├── Dockerfile.backend         # Backend FastAPI Docker image build
├── docker-compose.yml         # Container orchestration (Frontend + Backend)
├── requirements.txt           # Python dependencies
└── README.md                  # System documentation
```

---

## ⚡ Quick Start Guide

### 1. Installation & Environment Setup

```bash
# Clone repository or navigate to folder
cd Sanket

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Running the Streamlit Application (Standalone / Offline Mode)

Launch the Streamlit app directly:

```bash
streamlit run app.py
```

Open your browser at `http://localhost:8501`. The application will automatically detect whether the FastAPI backend is available and operate seamlessly.

### 3. Running with Live FastAPI Backend (Optional)

#### Step A: Start the FastAPI Backend

```bash
uvicorn backend.main:app --reload --port 8000
```

FastAPI Interactive Swagger Docs: `http://localhost:8000/docs`

#### Step B: Start the Streamlit Frontend in another terminal

```bash
streamlit run app.py
```

---

## 🐳 Docker Deployment

To launch both Frontend and Backend using Docker Compose:

```bash
docker-compose up --build
```

- **Streamlit Frontend**: `http://localhost:8501`
- **FastAPI Backend**: `http://localhost:8000`

---

## ☁️ Cloud Deployment Options

### Streamlit Community Cloud

1. Push this repository to GitHub.
2. Sign in to [Streamlit Cloud](https://streamlit.io/cloud).
3. Connect your repository and set `app.py` as the Main File Path.
4. Deploy!

### Heroku / AWS ECS / GCP Cloud Run

Use the included `Dockerfile` and `Dockerfile.backend` to deploy containerized services to Heroku, Google Cloud Run, or AWS App Runner.

---

## 🔬 ML Model Feature Definitions

| Feature | Physical Meaning | Unit | Severe Risk Threshold |
| --- | --- | --- | --- |
| `iwv_accumulation_rate` | Integrated Water Vapor accumulation rate | kg/m²/h | > 7.0 kg/m²/h |
| `ctt_drop_rate` | Cloud Top Temperature cooling rate | °C/h | > 12.0 °C/h |
| `cape` | Convective Available Potential Energy | J/kg | > 2500 J/kg |
| `cin` | Convective Inhibition capping energy | J/kg | < 25 J/kg |
| `wind_shear_0_6km` | 0-6km Vertical Wind Shear | m/s | > 20.0 m/s |
| `relative_humidity_850` | 850hPa Lower Troposphere Humidity | % | > 85% |
| `pressure_drop_3h` | 3-Hour Surface Pressure Drop | hPa | > 3.5 hPa |

---

## 📜 License

Apache License 2.0 - SANKET Severe Weather Nowcasting Project.
