# SANKET: AI-Driven Severe Weather Warning System 🛰️⚡

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-cyan.svg)](https://sih.gov.in)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-blue.svg)](#tech-stack)
[![Satellite](https://img.shields.io/badge/Data-INSAT--3D%2F3DR%20MOSDAC-orange.svg)](#key-features)

> **SANKET** is a production-grade, hyper-local severe weather nowcasting system built for **Smart India Hackathon 2026**. It ingests real-time **INSAT-3D / INSAT-3DR** satellite telemetry from ISRO MOSDAC, predicts extreme weather hazards (cloudbursts, flash floods, severe thunderstorms, hailstorms) via an **XGBoost** ML model with **SHAP** explainability, and broadcasts sub-second emergency alerts over WebSockets to NDRF command centers.

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Redux Toolkit, React Query, Framer Motion, Leaflet.js, Recharts, Material-UI, Tailwind CSS, Socket.io-client |
| **Backend API** | Node.js, Express.js, MongoDB (Geospatial 2DSphere), Redis, Socket.io, JWT Authentication |
| **ML Microservice** | Python 3.11, FastAPI, XGBoost, SHAP, Pandas, NumPy, Scikit-Learn |
| **DevOps & Deploy** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## Key Features

1. **Dark Glassmorphic UI/UX**: Custom color scheme (`#0a1628` deep navy background, `#00d4ff` cyan glow accent, `#ff6b35` alert orange), Orbitron headers, Inter body text, and HTML5 canvas particle atmospheric networks.
2. **Live MOSDAC Satellite Stream**: Automated 5-minute ingestion of INSAT-3D/3DR sounder & imager channels extracting Integrated Water Vapor (IWV), Cloud Top Temperature (CTT), and Convective Available Potential Energy (CAPE).
3. **Interactive Operations Dashboard**: High-risk warning cards with countdown timers, real-time atmospheric telemetry gauges, and Recharts trajectory graphs.
4. **Geospatial Risk Map**: Leaflet map with GeoJSON risk polygons, critical infrastructure asset markers (hydro dams, power grids, bridges), and 24-hour timeline replay slider.
5. **Emergency Alert Center**: Hazard categorization (Cloudburst, Flash Flood, Thunderstorm, Hailstorm), severity filter chips, officer acknowledgment workflow, and audit logging.
6. **Asset Proximity Tracker**: Geospatial radius calculation evaluating distance from critical infrastructure to severe convective storm cells.
7. **ML Analytics & SHAP Explainability**: Model precision & recall metrics, confusion matrix, and interactive SHAP waterfall/bar charts explaining why the ML engine flagged a critical risk.

---

## API Endpoints

### Auth Endpoints (`/api/auth/*`)

- `POST /api/auth/register` - Create user/officer account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Profile & organization info

### Satellite Endpoints (`/api/satellite/*`)

- `GET /api/satellite/latest` - Fetch latest INSAT-3D/3DR 5-minute telemetry scan
- `POST /api/satellite/ingest` - Force satellite scan ingest & Redis update
- `GET /api/satellite/timeline` - 24-hour historical scan frames for map replay

### ML Prediction Endpoints (`/api/predict/*`)

- `POST /api/predict/nowcast` - Run XGBoost severe weather nowcast
- `POST /api/predict/shap` - Generate SHAP feature attributions

### Alert Endpoints (`/api/alerts/*`)

- `GET /api/alerts` - List active & historical alerts with severity/hazard filters
- `POST /api/alerts` - Create manual override alert
- `POST /api/alerts/:id/acknowledge` - Officer acknowledgment workflow

### Asset Endpoints (`/api/assets/*`)

- `GET /api/assets` - Infrastructure asset list & hazard distance matrix
- `POST /api/assets` - Register new infrastructure asset
- `GET /api/assets/:id/assess` - Dynamic risk assessment for asset

### Map Endpoints (`/api/map/*`)

- `GET /api/map/risk-zones` - GeoJSON polygons for active danger zones
- `GET /api/map/overlays` - Heatmap & tile layer metadata

---

## Local Quickstart & Running

### Option 1: Running via Docker Compose (Recommended)

```bash
docker compose up --build
```

Access the application at `http://localhost`.

### Option 2: Standalone Local Development

Each service features built-in fallback modes (in-memory MongoDB/Redis fallbacks) so you can run locally without external databases:

#### 1. Start Python FastAPI ML Microservice

```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

#### 2. Start Express Backend

```bash
cd backend
npm install
npm run dev
```

#### 3. Start React Vite Frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:3000`.

---

*Developed for Smart India Hackathon 2026.*
