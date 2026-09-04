"""
SANKET - Severe Weather Early Warning Nowcasting System
Main Streamlit Application Entry Point
"""
import streamlit as st
import config

from components.data_layer import (
    data_manager,
    cached_fetch_risk_zones,
    cached_fetch_assets,
    cached_fetch_weather_grid,
    cached_fetch_historical_events
)
from components.map_component import render_interactive_map
from components.dashboard_component import (
    render_risk_kpi_cards,
    render_realtime_metrics_grid,
    render_trend_charts,
    render_regional_distribution
)
from components.replay_component import render_historical_replay
from components.explainability import render_explainability_panel
from components.alert_center import render_alert_center
from components.asset_monitor import render_asset_monitoring

# Set Page Config (Must be first Streamlit call)
st.set_page_config(
    page_title="SANKET - AI Severe Weather Nowcasting",
    page_icon="⛈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Dark Modern CSS Theme Injection
st.markdown("""
<style>
    /* Dark Theme Styles */
    .stApp {
        background-color: #0F172A;
        color: #F8FAFC;
    }
    .css-1d37w0k, .css-12w0qpk {
        background-color: #1E293B;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #1E293B;
        padding: 6px;
        border-radius: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 44px;
        border-radius: 6px;
        color: #94A3B8;
        font-weight: 600;
    }
    .stTabs [aria-selected="true"] {
        background-color: #3B82F6 !important;
        color: #FFFFFF !important;
    }
    .metric-card {
        background-color: #1E293B;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #334155;
    }
    header[data-testid="stHeader"] {
        background-color: #0F172A;
    }
</style>
""", unsafe_allow_html=True)


def main():
    """Main execution workflow for SANKET Streamlit Application."""
    # ---------------------------------------------------------
    # SIDEBAR CONTROLS & METEOROLOGICAL PARAMETER SIMULATOR
    # ---------------------------------------------------------
    st.sidebar.image("https://img.icons8.com/color/96/storm--v1.png", width=64)
    st.sidebar.title("⚡ SANKET NOWCAST")
    st.sidebar.caption("AI-Driven Hyper-Local Weather Early Warning")

    st.sidebar.markdown("---")

    # Data Mode Switcher & Backend Health Check
    st.sidebar.subheader("🔌 Data Connection Mode")
    force_offline = st.sidebar.checkbox("Demo Mode (Offline Data)", value=False)

    is_backend_alive, conn_status_msg = data_manager.check_backend_connection()
    if is_backend_alive and not force_offline:
        st.sidebar.success(f"🟢 {conn_status_msg}")
    else:
        st.sidebar.info(f"🟠 {conn_status_msg}")

    st.sidebar.markdown("---")

    # Interactive Meteorological Parameter Controls (Live Simulation)
    st.sidebar.subheader("🎛️ Live Weather Simulation Sliders")
    st.sidebar.caption("Adjust input parameters to simulate storm evolution:")

    sim_iwv = st.sidebar.slider(
        "IWV Accumulation Rate (kg/m²/h)",
        min_value=0.5, max_value=15.0, value=8.2, step=0.1,
        help="Integrated Water Vapor accumulation rate"
    )
    sim_ctt = st.sidebar.slider(
        "CTT Drop Rate (°C/h)",
        min_value=0.0, max_value=30.0, value=16.5, step=0.5,
        help="Cloud Top Temperature cooling rate"
    )
    sim_cape = st.sidebar.slider(
        "CAPE Instability (J/kg)",
        min_value=100, max_value=5000, value=3150, step=50,
        help="Convective Available Potential Energy"
    )
    sim_cin = st.sidebar.slider(
        "CIN Capping Barrier (J/kg)",
        min_value=0, max_value=200, value=12, step=2
    )
    sim_shear = st.sidebar.slider(
        "0-6km Wind Shear (m/s)",
        min_value=0.0, max_value=40.0, value=24.2, step=0.5
    )
    sim_rh = st.sidebar.slider(
        "850hPa Relative Humidity (%)",
        min_value=30, max_value=100, value=92
    )
    sim_press = st.sidebar.slider(
        "3h Pressure Drop (hPa)",
        min_value=0.0, max_value=10.0, value=4.5, step=0.1
    )

    # Current Live Features Dictionary
    input_features = {
        "iwv_accumulation_rate": sim_iwv,
        "ctt_drop_rate": sim_ctt,
        "cape": float(sim_cape),
        "cin": float(sim_cin),
        "wind_shear_0_6km": sim_shear,
        "relative_humidity_850": float(sim_rh),
        "pressure_drop_3h": sim_press
    }

    # Fetch Prediction Result
    prediction_data = data_manager.get_prediction(
        input_features,
        force_offline=force_offline
    )

    st.sidebar.markdown("---")

    # Map Layer Toggle Controls in Sidebar
    st.sidebar.subheader("🗺️ Map Layer Toggles")
    layer_risk_zones = st.sidebar.checkbox("Weather Risk Zones", value=True)
    layer_iwv = st.sidebar.checkbox("IWV Vapor Heatmap", value=True)
    layer_cape = st.sidebar.checkbox("CAPE Instability Overlay", value=True)
    layer_ctt = st.sidebar.checkbox("CTT Cooling Rate Heatmap", value=True)
    layer_dem = st.sidebar.checkbox("DEM Elevation Hillshade", value=True)

    # ---------------------------------------------------------
    # MAIN APPLICATION HEADER
    # ---------------------------------------------------------
    col_hdr1, col_hdr2 = st.columns([3, 1])
    with col_hdr1:
        st.title("⚡ SANKET : Severe Weather Early Warning System")
        st.markdown(
            "**AI Nowcasting Engine** | Predicting Thunderstorms, Cloudbursts "
            "& Flash Floods **2 to 6 Hours** in advance using XGBoost"
        )

    with col_hdr2:
        alert_lvl = prediction_data.get("alert_level", "GREEN")
        badge_color = config.RISK_COLORS.get(alert_lvl, "#10B981")
        st.markdown(f"""
        <div style="background-color: #1E293B; border: 2px solid {badge_color};
                    border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #94A3B8;
                        text-transform: uppercase; font-weight: bold;">
                SYSTEM ALERT LEVEL
            </div>
            <div style="font-size: 22px; font-weight: 900;
                        color: {badge_color}; margin-top: 2px;">
                {alert_lvl}
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # ---------------------------------------------------------
    # TAB NAVIGATION SYSTEM
    # ---------------------------------------------------------
    tab_map, tab_dash, tab_replay, tab_shap, tab_alerts, tab_assets = st.tabs([
        "🗺️ Interactive Risk Map",
        "📊 Real-Time Risk Dashboard",
        "⏪ Historical Event Replay",
        "🔍 AI Explainability (SHAP)",
        "🚨 Emergency Alert Center",
        "🏢 Asset Monitoring"
    ])

    # ---------------------------------------------------------
    # TAB 1: INTERACTIVE GEOSPATIAL MAP (PRIMARY VIEW)
    # ---------------------------------------------------------
    with tab_map:
        st.markdown("### 🗺️ Live Regional Weather Risk Map & Overlays")
        st.caption(
            "Hover over risk zones or click critical asset pins for real-time hazard intelligence."
        )

        # Load Datasets
        risk_zones_data = cached_fetch_risk_zones(force_offline=force_offline)
        assets_data = cached_fetch_assets(force_offline=force_offline)
        weather_grid_data = cached_fetch_weather_grid(force_offline=force_offline)

        # Top KPI Quick Banner
        render_risk_kpi_cards(prediction_data)
        st.markdown("<br>", unsafe_allow_html=True)

        # Render Interactive Folium Map
        render_interactive_map(
            risk_zones_geojson=risk_zones_data,
            assets_list=assets_data,
            weather_grid=weather_grid_data,
            show_risk_zones=layer_risk_zones,
            show_iwv_overlay=layer_iwv,
            show_cape_overlay=layer_cape,
            show_ctt_overlay=layer_ctt,
            show_dem_hillshade=layer_dem
        )

    # ---------------------------------------------------------
    # TAB 2: RISK DASHBOARD & ANALYTICS
    # ---------------------------------------------------------
    with tab_dash:
        render_risk_kpi_cards(prediction_data)
        st.markdown("---")
        render_realtime_metrics_grid(input_features, prediction_data)
        st.markdown("---")
        render_trend_charts(prediction_data, input_features)
        render_regional_distribution()

    # ---------------------------------------------------------
    # TAB 3: HISTORICAL EVENT REPLAY
    # ---------------------------------------------------------
    with tab_replay:
        historical_events = cached_fetch_historical_events(
            force_offline=force_offline
        )
        render_historical_replay(historical_events)

    # ---------------------------------------------------------
    # TAB 4: SHAP EXPLAINABILITY MODULE
    # ---------------------------------------------------------
    with tab_shap:
        render_explainability_panel(prediction_data, input_features)

    # ---------------------------------------------------------
    # TAB 5: ALERT CENTER & PLAYBOOKS
    # ---------------------------------------------------------
    with tab_alerts:
        alerts_data = data_manager.get_alerts(force_offline=force_offline)
        render_alert_center(alerts_data)

    # ---------------------------------------------------------
    # TAB 6: CRITICAL ASSET VULNERABILITY MONITORING
    # ---------------------------------------------------------
    with tab_assets:
        render_asset_monitoring(cached_fetch_assets(force_offline=force_offline))


if __name__ == "__main__":
    main()
