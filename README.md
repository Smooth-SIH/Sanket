# SANKET — Hyper-local Severe Weather Nowcasting System 🛰️⚡

**SANKET** is an AI-driven, hyper-local severe weather nowcasting system engineered to predict micro-scale cloudbursts, flash floods, severe thunderstorms, and hailstorms with lead times up to 45 minutes by ingesting real-time ISRO MOSDAC INSAT-3D/3DR satellite sounder telemetry.

---

## Key Features & System Capabilities

### 🛰️ Real-Time MOSDAC Satellite Telemetry Stream

- Automated 5-minute ingestion cycle fetching INSAT-3D and INSAT-3DR sounder and imager products.
- Real-time extraction of atmospheric stability metrics: Integrated Water Vapor (IWV), Cloud Top Temperature (CTT), Convective Available Potential Energy (CAPE), and Convective Inhibition (CIN).

### 🤖 XGBoost Machine Learning Nowcast Engine

- High-precision classifier trained on physical atmospheric parameters to detect micro-scale convective storm generation.
- Sub-second inference producing hazard probability scores, severity levels (CRITICAL, WARNING, WATCH), and estimated early warning lead times.

### 🔍 SHAP Explainable AI (XAI)

- Transparent feature attribution using SHAP TreeExplainer to break down the exact physical contributors driving every severe weather warning.
- Real-time visual waterfall and bar breakdown of parameters increasing or decreasing storm risk.

### 🗺️ Geospatial Risk Map & GeoJSON Polygons

- Interactive Leaflet geospatial map with high-reliability dark atmospheric styling.
- 2DSphere spatial index querying generating GeoJSON risk polygon overlays for cloudburst danger zones and flash flood contours.
- 24-hour satellite timeline replay slider allowing users to scrub through historical storm formation trajectories.

### 🚨 Emergency Alert Center

- Real-time alert dispatch categorized by hazard type (Cloudburst, Flash Flood, Severe Thunderstorm, Hailstorm) and severity level.
- Multi-officer alert acknowledgment workflow with digital signature tracking and audit logs.

### 🛡️ Critical Infrastructure Asset Tracker

- Location monitoring and risk assessment for critical infrastructure including hydro dams, power grids, telecom towers, bridges, hospitals, and relief camps.
- Automated distance matrix calculations measuring exact proximity from assets to active hazard zones.

### ⚡ Sub-Second WebSocket Telemetry Stream

- Live Socket.io event broadcasting delivering satellite updates and critical hazard warnings to user consoles with sub-second latency.
