"""
SANKET Mock Geospatial & Meteorological Data Generator
Provides synthetic datasets for India weather nowcasting,
historical replay events, and asset inventories.
"""
from datetime import datetime, timedelta
import numpy as np


def get_current_risk_zones():
    """Generates GeoJSON FeatureCollection of risk zones in Mumbai."""
    features = [
        {
            "type": "Feature",
            "properties": {
                "zone_id": "Z-MUM-COAST",
                "zone_name": "Mumbai South-Central Coastal Belt",
                "risk_level": "HIGH",
                "overall_risk_pct": 89.4,
                "thunderstorm_risk": 92.0,
                "cloudburst_risk": 84.5,
                "flash_flood_risk": 91.8,
                "lead_time": "2-3 Hours",
                "iwv": 52.4,           # kg/m²
                "iwv_rate": 8.2,       # kg/m²/hr
                "cape": 3150,          # J/kg
                "cin": 12,             # J/kg
                "ctt_drop": 16.5,      # °C/hr
                "rainfall_rate": 68.5,  # mm/hr
                "wind_shear": 24.2,    # m/s
                "dem_elevation": 4.5   # meters
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.80, 18.92], [72.86, 18.92], [72.88, 19.04],
                    [72.82, 19.05], [72.80, 18.92]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "Z-THANE-RIDGE",
                "zone_name": "Thane Creek & Eastern Ridge",
                "risk_level": "MODERATE",
                "overall_risk_pct": 68.2,
                "thunderstorm_risk": 74.0,
                "cloudburst_risk": 62.0,
                "flash_flood_risk": 68.5,
                "lead_time": "3-4 Hours",
                "iwv": 44.1,
                "iwv_rate": 4.8,
                "cape": 2400,
                "cin": 35,
                "ctt_drop": 9.8,
                "rainfall_rate": 34.0,
                "wind_shear": 18.0,
                "dem_elevation": 28.0
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.95, 19.12], [73.05, 19.12], [73.08, 19.24],
                    [72.96, 19.25], [72.95, 19.12]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "Z-NAVI-AIRPORT",
                "zone_name": "Navi Mumbai Basin & Panvel Estuary",
                "risk_level": "YELLOW",
                "overall_risk_pct": 46.5,
                "thunderstorm_risk": 52.0,
                "cloudburst_risk": 38.0,
                "flash_flood_risk": 49.5,
                "lead_time": "4-5 Hours",
                "iwv": 38.5,
                "iwv_rate": 2.5,
                "cape": 1850,
                "cin": 65,
                "ctt_drop": 5.2,
                "rainfall_rate": 18.0,
                "wind_shear": 14.5,
                "dem_elevation": 12.0
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [73.00, 18.96], [73.12, 18.95], [73.15, 19.06],
                    [73.02, 19.08], [73.00, 18.96]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "Z-PUNE-GHATS",
                "zone_name": "Western Ghats Crest (Lonavala-Khandala)",
                "risk_level": "HIGH",
                "overall_risk_pct": 94.2,
                "thunderstorm_risk": 96.5,
                "cloudburst_risk": 93.0,
                "flash_flood_risk": 93.1,
                "lead_time": "1-3 Hours",
                "iwv": 56.8,
                "iwv_rate": 11.4,
                "cape": 3800,
                "cin": 8,
                "ctt_drop": 21.0,
                "rainfall_rate": 92.0,
                "wind_shear": 28.5,
                "dem_elevation": 620.0
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [73.35, 18.70], [73.50, 18.70], [73.52, 18.82],
                    [73.36, 18.83], [73.35, 18.70]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "Z-NORTH-SUBURBS",
                "zone_name": (
                    "North Borivali & Sanjay Gandhi Park Foothills"
                ),
                "risk_level": "SAFE",
                "overall_risk_pct": 22.0,
                "thunderstorm_risk": 25.0,
                "cloudburst_risk": 12.0,
                "flash_flood_risk": 29.0,
                "lead_time": ">6 Hours",
                "iwv": 29.0,
                "iwv_rate": 1.1,
                "cape": 1100,
                "cin": 120,
                "ctt_drop": 2.1,
                "rainfall_rate": 6.0,
                "wind_shear": 9.2,
                "dem_elevation": 45.0
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.83, 19.20], [72.94, 19.20], [72.93, 19.30],
                    [72.84, 19.30], [72.83, 19.20]
                ]]
            }
        }
    ]

    return {
        "type": "FeatureCollection",
        "features": features
    }


def get_critical_assets():
    """Generates inventory of monitored infrastructure assets."""
    return [
        {
            "id": "AST-SUB-01",
            "name": "Kalwa High Voltage Substation",
            "category": "Power Substations",
            "icon": "bolt",
            "lat": 19.1950,
            "lon": 72.9900,
            "address": "Kalwa Industrial Area, Thane",
            "current_risk": "HIGH",
            "risk_pct": 87.5,
            "vulnerability_score": 8.8,
            "submerge_depth_est_m": 0.65,
            "elevation_m": 14.0,
            "action": (
                "Deploy high-capacity flood pumps; activate transformer "
                "lightning divertors."
            )
        },
        {
            "id": "AST-SUB-02",
            "name": "Dharavi Power Distribution Hub",
            "category": "Power Substations",
            "icon": "bolt",
            "lat": 19.0420,
            "lon": 72.8550,
            "address": "Dharavi Sector 3, Mumbai",
            "current_risk": "HIGH",
            "risk_pct": 91.2,
            "vulnerability_score": 9.4,
            "submerge_depth_est_m": 0.85,
            "elevation_m": 5.0,
            "action": (
                "Isolate feeder lines in low-elevation basements; prepare "
                "mobile generator trucks."
            )
        },
        {
            "id": "AST-CST-01",
            "name": "Mumbai Coastal Road Project - Worli Package",
            "category": "Construction Sites",
            "icon": "hard-hat",
            "lat": 19.0020,
            "lon": 72.8150,
            "address": "Worli Sea Face Interchange",
            "current_risk": "HIGH",
            "risk_pct": 89.0,
            "vulnerability_score": 9.1,
            "submerge_depth_est_m": 0.70,
            "elevation_m": 3.2,
            "action": (
                "Secure high-rise tower cranes against >25m/s wind shear; "
                "evacuate caisson workers."
            )
        },
        {
            "id": "AST-CST-02",
            "name": "Metro Line 3 Aarey Car Shed & Station Site",
            "category": "Construction Sites",
            "icon": "hard-hat",
            "lat": 19.1350,
            "lon": 72.8850,
            "address": "Aarey Colony Entry, Jogeshwari East",
            "current_risk": "MODERATE",
            "risk_pct": 66.4,
            "vulnerability_score": 6.5,
            "submerge_depth_est_m": 0.30,
            "elevation_m": 38.0,
            "action": (
                "Clear temporary runoff channels; anchor heavy "
                "machinery on elevated ramps."
            )
        },
        {
            "id": "AST-TEL-01",
            "name": "Worli Ridge Telecom Gateway Tower",
            "category": "Telecom Towers",
            "icon": "signal",
            "lat": 19.0180,
            "lon": 72.8220,
            "address": "Worli Hill Road",
            "current_risk": "HIGH",
            "risk_pct": 84.0,
            "vulnerability_score": 7.8,
            "submerge_depth_est_m": 0.10,
            "elevation_m": 42.0,
            "action": (
                "Switch backup batteries to trickle charging; alert radio "
                "engineers for lightning surges."
            )
        },
        {
            "id": "AST-TEL-02",
            "name": "Navi Mumbai Airport Microwave Relay Tower",
            "category": "Telecom Towers",
            "icon": "signal",
            "lat": 18.9950,
            "lon": 73.0720,
            "address": "Ulwe Node, Navi Mumbai",
            "current_risk": "YELLOW",
            "risk_pct": 48.0,
            "vulnerability_score": 5.2,
            "submerge_depth_est_m": 0.15,
            "elevation_m": 18.0,
            "action": (
                "Routine status check; verify remote telemetry links."
            )
        },
        {
            "id": "AST-FLD-01",
            "name": "Hindmata Junction Low Point (Mithi River Basin)",
            "category": "Flood-Prone Areas",
            "icon": "water",
            "lat": 19.0110,
            "lon": 72.8430,
            "address": "Dadar East / Hindmata Underpass",
            "current_risk": "HIGH",
            "risk_pct": 95.8,
            "vulnerability_score": 9.9,
            "submerge_depth_est_m": 1.20,
            "elevation_m": 2.1,
            "action": (
                "Close underpass to vehicular traffic immediately; turn "
                "on underground holding tank pumps."
            )
        },
        {
            "id": "AST-FLD-02",
            "name": "Milan Subway Underpass",
            "category": "Flood-Prone Areas",
            "icon": "water",
            "lat": 19.0880,
            "lon": 72.8440,
            "address": "Santacruz West",
            "current_risk": "HIGH",
            "risk_pct": 88.6,
            "vulnerability_score": 9.2,
            "submerge_depth_est_m": 0.90,
            "elevation_m": 3.0,
            "action": (
                "Activate automatic barrier gates; divert traffic to "
                "Gokhale Bridge."
            )
        },
        {
            "id": "AST-FLD-03",
            "name": "Kurla West Mithi River Bend",
            "category": "Flood-Prone Areas",
            "icon": "water",
            "lat": 19.0680,
            "lon": 72.8750,
            "address": "Kranti Nagar Slum / Mithi Floodplain",
            "current_risk": "HIGH",
            "risk_pct": 93.4,
            "vulnerability_score": 9.7,
            "submerge_depth_est_m": 1.10,
            "elevation_m": 3.5,
            "action": (
                "Issue loudspeakers evacuation warnings to riverside "
                "informal settlements."
            )
        }
    ]


def get_weather_grid_overlay():
    """Generates synthetic atmospheric grid points for contours."""
    grid_points = []
    lats = np.linspace(18.85, 19.35, 12)
    lons = np.linspace(72.75, 73.20, 12)

    np.random.seed(101)
    for lat in lats:
        for lon in lons:
            dist = np.sqrt((lat - 19.02)**2 + (lon - 72.84)**2)

            iwv = max(
                18.0, 58.0 - dist * 70.0 + np.random.uniform(-2, 2)
            )
            cape = max(
                300.0,
                3900.0 - dist * 5000.0 + np.random.uniform(-150, 150)
            )
            ctt_drop = max(
                1.0, 22.0 - dist * 32.0 + np.random.uniform(-1, 1)
            )

            grid_points.append({
                "lat": round(float(lat), 4),
                "lon": round(float(lon), 4),
                "iwv": round(float(iwv), 1),
                "cape": round(float(cape), 0),
                "ctt_drop": round(float(ctt_drop), 1)
            })

    return grid_points


def get_historical_events():
    """Provides historical severe weather event timeline datasets."""
    return {
        "mumbai_2020": {
            "title": (
                "Mumbai Severe Flash Floods & Cloudburst (August 2020)"
            ),
            "location": "Mumbai Metropolitan Region",
            "date": "2020-08-05",
            "summary": (
                "Explosive convective cloudburst delivering >300mm "
                "rainfall in 6 hours with peak wind shear > 30m/s."
            ),
            "timesteps": [
                {
                    "time_label": "T - 6 Hours",
                    "timestamp": "08:00 AM",
                    "overall_risk_pct": 28.5,
                    "alert_level": "GREEN",
                    "iwv": 32.1,
                    "cape": 1400,
                    "ctt_drop": 3.2,
                    "rainfall": 4.5,
                    "actual_observed_rain": 2.0,
                    "xgb_predicted_rain": 3.5,
                    "risk_zone_status": (
                        "Low convective activity over Arabian Sea."
                    )
                },
                {
                    "time_label": "T - 5 Hours",
                    "timestamp": "09:00 AM",
                    "overall_risk_pct": 42.0,
                    "alert_level": "YELLOW",
                    "iwv": 38.4,
                    "cape": 1950,
                    "ctt_drop": 6.5,
                    "rainfall": 12.0,
                    "actual_observed_rain": 8.0,
                    "xgb_predicted_rain": 11.2,
                    "risk_zone_status": (
                        "Rapid moisture surge inward; CAPE rising sharply."
                    )
                },
                {
                    "time_label": "T - 4 Hours",
                    "timestamp": "10:00 AM",
                    "overall_risk_pct": 64.5,
                    "alert_level": "ORANGE",
                    "iwv": 45.2,
                    "cape": 2700,
                    "ctt_drop": 11.8,
                    "rainfall": 28.5,
                    "actual_observed_rain": 22.0,
                    "xgb_predicted_rain": 26.8,
                    "risk_zone_status": (
                        "Early Orange Warning issued. Updrafts."
                    )
                },
                {
                    "time_label": "T - 3 Hours",
                    "timestamp": "11:00 AM",
                    "overall_risk_pct": 82.0,
                    "alert_level": "ORANGE",
                    "iwv": 51.0,
                    "cape": 3300,
                    "ctt_drop": 15.4,
                    "rainfall": 48.0,
                    "actual_observed_rain": 41.0,
                    "xgb_predicted_rain": 46.5,
                    "risk_zone_status": (
                        "CTT drop > 15°C/hr. Cloudburst signature forming."
                    )
                },
                {
                    "time_label": "T - 2 Hours",
                    "timestamp": "12:00 PM",
                    "overall_risk_pct": 94.8,
                    "alert_level": "RED",
                    "iwv": 56.4,
                    "cape": 3850,
                    "ctt_drop": 19.8,
                    "rainfall": 78.0,
                    "actual_observed_rain": 72.0,
                    "xgb_predicted_rain": 76.0,
                    "risk_zone_status": (
                        "RED ALERT: SANKET predicted flash flood peak "
                        "110 mins in advance."
                    )
                },
                {
                    "time_label": "T - 1 Hour",
                    "timestamp": "01:00 PM",
                    "overall_risk_pct": 98.2,
                    "alert_level": "RED",
                    "iwv": 59.8,
                    "cape": 4100,
                    "ctt_drop": 23.5,
                    "rainfall": 115.0,
                    "actual_observed_rain": 110.0,
                    "xgb_predicted_rain": 112.5,
                    "risk_zone_status": (
                        "Extreme Downpour Event in progress across Mumbai."
                    )
                },
                {
                    "time_label": "T = Event Peak",
                    "timestamp": "02:00 PM",
                    "overall_risk_pct": 99.5,
                    "alert_level": "RED",
                    "iwv": 61.2,
                    "cape": 4250,
                    "ctt_drop": 25.0,
                    "rainfall": 142.0,
                    "actual_observed_rain": 138.0,
                    "xgb_predicted_rain": 140.0,
                    "risk_zone_status": (
                        "Peak deluge inundation reached. Accuracy: 96.4%."
                    )
                }
            ]
        },
        "uttarakhand_2021": {
            "title": (
                "Uttarakhand Himalayan Cloudburst Event (August 2021)"
            ),
            "location": "Chamoli-Rudraprayag Valley",
            "date": "2021-08-29",
            "summary": (
                "Orographic forced cloudburst along steep Himalayan "
                "slopes triggering flash floods."
            ),
            "timesteps": [
                {
                    "time_label": "T - 4 Hours",
                    "timestamp": "02:00 PM",
                    "overall_risk_pct": 35.0,
                    "alert_level": "YELLOW",
                    "iwv": 34.0,
                    "cape": 1800,
                    "ctt_drop": 5.0,
                    "rainfall": 10.0,
                    "actual_observed_rain": 8.0,
                    "xgb_predicted_rain": 9.5,
                    "risk_zone_status": "Valley moisture pooling."
                },
                {
                    "time_label": "T - 2 Hours",
                    "timestamp": "04:00 PM",
                    "overall_risk_pct": 72.0,
                    "alert_level": "ORANGE",
                    "iwv": 46.5,
                    "cape": 2900,
                    "ctt_drop": 14.2,
                    "rainfall": 45.0,
                    "actual_observed_rain": 40.0,
                    "xgb_predicted_rain": 43.8,
                    "risk_zone_status": (
                        "Severe Orographic updrafts triggering cloud cell."
                    )
                },
                {
                    "time_label": "T = Event Peak",
                    "timestamp": "06:00 PM",
                    "overall_risk_pct": 97.0,
                    "alert_level": "RED",
                    "iwv": 58.0,
                    "cape": 3900,
                    "ctt_drop": 24.1,
                    "rainfall": 125.0,
                    "actual_observed_rain": 120.0,
                    "xgb_predicted_rain": 123.0,
                    "risk_zone_status": "Cloudburst peak over valley."
                }
            ]
        }
    }


def get_recent_alerts():
    """Returns active emergency alerts feed."""
    now = datetime.now()
    return [
        {
            "id": "ALT-2026-098",
            "timestamp": (
                (now - timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S")
            ),
            "severity": "RED",
            "title": (
                "Severe Cloudburst & Flash Flood Threat - "
                "Mumbai Coastal Belt"
            ),
            "affected_zones": [
                "Mumbai South-Central Coastal Belt", "Western Ghats Crest"
            ],
            "lead_time": "2 Hours",
            "thunderstorm_risk_pct": 92.0,
            "cloudburst_risk_pct": 84.5,
            "flash_flood_risk_pct": 91.8,
            "acknowledged": False
        },
        {
            "id": "ALT-2026-097",
            "timestamp": (
                (now - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S")
            ),
            "severity": "ORANGE",
            "title": (
                "High Thunderstorm Nowcast - Thane Creek & Eastern Suburbs"
            ),
            "affected_zones": ["Thane Creek & Eastern Ridge"],
            "lead_time": "3 Hours",
            "thunderstorm_risk_pct": 74.0,
            "cloudburst_risk_pct": 62.0,
            "flash_flood_risk_pct": 68.5,
            "acknowledged": True
        },
        {
            "id": "ALT-2026-096",
            "timestamp": (
                (now - timedelta(hours=2, minutes=10)).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            ),
            "severity": "YELLOW",
            "title": "Elevated Moisture Convergence - Navi Mumbai Basin",
            "affected_zones": ["Navi Mumbai Basin & Panvel Estuary"],
            "lead_time": "4.5 Hours",
            "thunderstorm_risk_pct": 52.0,
            "cloudburst_risk_pct": 38.0,
            "flash_flood_risk_pct": 49.5,
            "acknowledged": True
        }
    ]
