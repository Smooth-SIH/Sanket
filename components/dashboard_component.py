"""
SANKET Risk Dashboard & Plotly Metrics Visualization Component
Renders KPI Summary Cards, Diagnostic Gauges, and Trend Charts.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import config


def render_mausamrakshak_hazard_cards(live_data: dict):
    """Renders the 3 Reference Hazard Cards (Thunderstorm, Cloudburst, Flash Flood) matching App.tsx."""
    st.markdown("### 🌩️ MausamRakshak AI Live Hazard Risk Assessment")

    storm_prob = live_data.get("thunderstorm_probability")
    cb_prob = live_data.get("cloudburst_probability")
    flood_prob = live_data.get("flash_flood_probability")
    final_flood = live_data.get("final_flood_risk")

    def get_badge_html(prob):
        if prob is None:
            return '<div style="background-color: #334155; color: #94A3B8; padding: 4px 10px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px;">LOADING</div>'
        if prob >= 70:
            return '<div style="background-color: #7F1D1D; color: #FCA5A5; border: 1px solid #EF4444; padding: 4px 10px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px;">HIGH RISK</div>'
        if prob >= 40:
            return '<div style="background-color: #7C2D12; color: #FDBA74; border: 1px solid #F97316; padding: 4px 10px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px;">MODERATE RISK</div>'
        return '<div style="background-color: #064E3B; color: #6EE7B7; border: 1px solid #10B981; padding: 4px 10px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px;">LOW RISK</div>'

    h1, h2, h3 = st.columns(3)

    with h1:
        st.markdown(f"""
        <div style="background-color: #1E293B; border: 1px solid #334155; border-top: 4px solid #F59E0B; padding: 18px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0; color: #F8FAFC;">Thunderstorm</h4>
            <div style="font-size: 34px; font-weight: 900; color: #F59E0B; margin: 10px 0;">
                {f"{storm_prob}%" if storm_prob is not None else "Loading..."}
            </div>
            <p style="color: #94A3B8; font-size: 13px; margin-bottom: 12px;">AI Storm Probability</p>
            {get_badge_html(storm_prob)}
        </div>
        """, unsafe_allow_html=True)

    with h2:
        st.markdown(f"""
        <div style="background-color: #1E293B; border: 1px solid #334155; border-top: 4px solid #EF4444; padding: 18px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0; color: #F8FAFC;">Cloudburst</h4>
            <div style="font-size: 34px; font-weight: 900; color: #EF4444; margin: 10px 0;">
                {f"{cb_prob}%" if cb_prob is not None else "Loading..."}
            </div>
            <p style="color: #94A3B8; font-size: 13px; margin-bottom: 12px;">AI Cloudburst Probability</p>
            {get_badge_html(cb_prob)}
        </div>
        """, unsafe_allow_html=True)

    with h3:
        st.markdown(f"""
        <div style="background-color: #1E293B; border: 1px solid #334155; border-top: 4px solid #3B82F6; padding: 18px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0; color: #F8FAFC;">Flash Flood</h4>
            <div style="font-size: 34px; font-weight: 900; color: #60A5FA; margin: 10px 0;">
                {f"{final_flood}%" if final_flood is not None else "Loading..."}
            </div>
            <p style="color: #94A3B8; font-size: 13px; margin-bottom: 8px;">Terrain-Adjusted Flood Risk</p>
            {get_badge_html(final_flood)}
            <div style="color: #64748B; font-size: 11px; margin-top: 8px;">
                AI Probability: {f"{flood_prob}%" if flood_prob is not None else "Loading..."}
            </div>
        </div>
        """, unsafe_allow_html=True)


def render_risk_kpi_cards(prediction_data: dict):
    """Renders top Risk Summary Cards with color-coded badges."""
    alert_level = prediction_data.get("alert_level", "GREEN")
    alert_info = config.ALERT_PLAYBOOKS.get(
        alert_level,
        config.ALERT_PLAYBOOKS["GREEN"]
    )
    badge_color = alert_info["badge_color"]

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(f"""
        <div style="background-color: #1E293B;
                    border-left: 5px solid {badge_color};
                    padding: 14px; border-radius: 8px;">
            <div style="color: #94A3B8; font-size: 13px;
                        font-weight: 600; text-transform: uppercase;">
                Current Alert Level
            </div>
            <div style="font-size: 26px; font-weight: 800;
                        color: {badge_color}; margin-top: 4px;">
                {alert_level} ALERT
            </div>
            <div style="color: #CBD5E1; font-size: 12px; margin-top: 4px;">
                Lead Time: {prediction_data.get('lead_time_hours', '2-6 Hrs')}
            </div>
        </div>
        """, unsafe_allow_html=True)


    with col2:
        ts_risk = prediction_data.get("thunderstorm_risk", 0.0)
        if ts_risk > 75:
            sev_label = 'HIGH'
        elif ts_risk > 45:
            sev_label = 'MODERATE'
        else:
            sev_label = 'LOW'

        st.markdown(f"""
        <div style="background-color: #1E293B;
                    border-left: 5px solid #F59E0B;
                    padding: 14px; border-radius: 8px;">
            <div style="color: #94A3B8; font-size: 13px;
                        font-weight: 600; text-transform: uppercase;">
                Thunderstorm Risk
            </div>
            <div style="font-size: 26px; font-weight: 800;
                        color: #F8FAFC; margin-top: 4px;">
                ⚡ {ts_risk}%
            </div>
            <div style="color: #F59E0B; font-size: 12px; margin-top: 4px;">
                {sev_label} SEVERITY
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        cb_risk = prediction_data.get("cloudburst_risk", 0.0)
        if cb_risk > 75:
            cb_label = 'CRITICAL'
        elif cb_risk > 40:
            cb_label = 'ELEVATED'
        else:
            cb_label = 'LOW'

        st.markdown(f"""
        <div style="background-color: #1E293B;
                    border-left: 5px solid #EF4444;
                    padding: 14px; border-radius: 8px;">
            <div style="color: #94A3B8; font-size: 13px;
                        font-weight: 600; text-transform: uppercase;">
                Cloudburst Risk
            </div>
            <div style="font-size: 26px; font-weight: 800;
                        color: #F8FAFC; margin-top: 4px;">
                🌧️ {cb_risk}%
            </div>
            <div style="color: #EF4444; font-size: 12px; margin-top: 4px;">
                {cb_label} THREAT
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        ff_risk = prediction_data.get("flash_flood_risk", 0.0)
        st.markdown(f"""
        <div style="background-color: #1E293B;
                    border-left: 5px solid #3B82F6;
                    padding: 14px; border-radius: 8px;">
            <div style="color: #94A3B8; font-size: 13px;
                        font-weight: 600; text-transform: uppercase;">
                Flash Flood Risk
            </div>
            <div style="font-size: 26px; font-weight: 800;
                        color: #F8FAFC; margin-top: 4px;">
                🌊 {ff_risk}%
            </div>
            <div style="color: #60A5FA; font-size: 12px; margin-top: 4px;">
                Confidence: {prediction_data.get('confidence_score', 92)}%
            </div>
        </div>
        """, unsafe_allow_html=True)


def render_realtime_metrics_grid(features: dict, prediction_data: dict):
    """Renders 6 atmospheric metrics widgets with physical units."""
    st.markdown("### 🌡️ Real-Time Atmospheric Diagnostic Parameters")

    m1, m2, m3, m4, m5, m6 = st.columns(6)

    with m1:
        iwv_r = features.get("iwv_accumulation_rate", 8.2)
        st.metric(
            label="IWV Accumulation Rate",
            value=f"{iwv_r} kg/m²/h",
            delta=f"+{round(iwv_r*0.12, 1)}/h" if iwv_r > 5 else "Normal",
            delta_color="normal" if iwv_r < 5 else "inverse"
        )

    with m2:
        cape = features.get("cape", 3150)
        st.metric(
            label="CAPE Instability",
            value=f"{int(cape)} J/kg",
            delta=f"+{int(cape*0.08)} J/kg" if cape > 2000 else "Stable",
            delta_color="normal" if cape < 2000 else "inverse"
        )

    with m3:
        ctt_d = features.get("ctt_drop_rate", 16.5)
        st.metric(
            label="CTT Cooling Rate",
            value=f"-{ctt_d} °C/h",
            delta="Explosive" if ctt_d > 12 else "Moderate",
            delta_color="normal" if ctt_d < 8 else "inverse"
        )

    with m4:
        cin = features.get("cin", 12.0)
        st.metric(
            label="CIN Barrier",
            value=f"{cin} J/kg",
            delta="Weak Cap" if cin < 25 else "Capped",
            delta_color="normal" if cin > 25 else "inverse"
        )

    with m5:
        shear = features.get("wind_shear_0_6km", 24.2)
        st.metric(
            label="0-6km Wind Shear",
            value=f"{shear} m/s",
            delta="Supercell Capable" if shear > 20 else "Moderate Shear"
        )

    with m6:
        conf = prediction_data.get("confidence_score", 94.5)
        st.metric(
            label="Model Confidence",
            value=f"{conf}%",
            delta=f"±{prediction_data.get('uncertainty_margin', 3.2)}%"
        )


def render_trend_charts(prediction_data: dict, features: dict):
    """Renders Plotly trend charts for 6-hour forecast and parameters."""
    st.markdown("### 📊 Nowcast Trends & Atmospheric Parameters")

    col_chart1, col_chart2 = st.columns(2)

    # 1. 6-Hour Hourly Risk Evolution Nowcast Curve
    with col_chart1:
        hours = [
            "Now (T=0)", "T+1h", "T+2h", "T+3h", "T+4h", "T+5h", "T+6h"
        ]
        base_risk = prediction_data.get("overall_risk_score", 75.0)

        ts_trend = [
            base_risk * f for f in [0.75, 0.88, 1.0, 0.95, 0.82, 0.65, 0.45]
        ]
        cb_trend = [
            prediction_data.get("cloudburst_risk", 70.0) * f
            for f in [0.60, 0.82, 1.0, 0.90, 0.70, 0.45, 0.25]
        ]
        ff_trend = [
            prediction_data.get("flash_flood_risk", 80.0) * f
            for f in [0.50, 0.70, 0.95, 1.0, 0.92, 0.78, 0.55]
        ]

        fig1 = go.Figure()
        fig1.add_trace(go.Scatter(
            x=hours, y=ts_trend, mode='lines+markers',
            name='Thunderstorm Risk',
            line=dict(color='#F59E0B', width=3)
        ))
        fig1.add_trace(go.Scatter(
            x=hours, y=cb_trend, mode='lines+markers',
            name='Cloudburst Risk',
            line=dict(color='#EF4444', width=3, dash='dash')
        ))
        fig1.add_trace(go.Scatter(
            x=hours, y=ff_trend, mode='lines+markers',
            name='Flash Flood Risk',
            line=dict(color='#3B82F6', width=3)
        ))

        fig1.add_hline(
            y=85, line_dash="dot", line_color="#EF4444",
            annotation_text="RED Alert Threshold (85%)",
            annotation_position="top left"
        )

        fig1.update_layout(
            title="6-Hour Nowcast Risk Trajectory",
            xaxis_title="Timeline",
            yaxis_title="Probability (%)",
            template="plotly_dark",
            paper_bgcolor="#1E293B",
            plot_bgcolor="#0F172A",
            height=360,
            legend=dict(
                orientation="h", yanchor="bottom", y=1.02,
                xanchor="right", x=1
            )
        )
        st.plotly_chart(fig1, use_container_width=True)

    # 2. Atmospheric Multi-Parameter Past History
    with col_chart2:
        past_hours = ["T-6h", "T-5h", "T-4h", "T-3h", "T-2h", "T-1h", "Now"]
        cape_hist = [
            800, 1100, 1600, 2200, 2750, 3050, features.get("cape", 3150)
        ]
        iwv_hist = [
            22.0, 26.5, 31.0, 37.5, 44.0, 48.5,
            features.get("iwv_accumulation_rate", 8.2) * 5.5
        ]

        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(
            x=past_hours, y=cape_hist, name='CAPE (J/kg)', yaxis='y1',
            line=dict(color='#F97316', width=3)
        ))
        fig2.add_trace(go.Scatter(
            x=past_hours, y=iwv_hist, name='IWV Vapor (kg/m²)', yaxis='y2',
            line=dict(color='#06B6D4', width=3, dash='dot')
        ))

        fig2.update_layout(
            title="Past 6-Hour Atmospheric Precursors Convergence",
            xaxis_title="History",
            yaxis=dict(
                title="CAPE (J/kg)",
                title_font=dict(color="#F97316"),
                tickfont=dict(color="#F97316")
            ),
            yaxis2=dict(
                title="IWV (kg/m²)",
                title_font=dict(color="#06B6D4"),
                tickfont=dict(color="#06B6D4"),
                overlaying='y',
                side='right'
            ),
            template="plotly_dark",
            paper_bgcolor="#1E293B",
            plot_bgcolor="#0F172A",
            height=360,
            legend=dict(
                orientation="h", yanchor="bottom", y=1.02,
                xanchor="right", x=1
            )
        )
        st.plotly_chart(fig2, use_container_width=True)


def render_regional_distribution():
    """Renders Regional Risk Level Distribution Donut Chart."""
    df_dist = pd.DataFrame({
        "Risk_Level": [
            "HIGH (Red)", "MODERATE (Orange)", "LOW (Yellow)", "SAFE (Green)"
        ],
        "Zones_Count": [2, 1, 1, 1]
    })

    fig = px.pie(
        df_dist,
        names="Risk_Level",
        values="Zones_Count",
        color="Risk_Level",
        color_discrete_map={
            "HIGH (Red)": "#EF4444",
            "MODERATE (Orange)": "#F97316",
            "LOW (Yellow)": "#F59E0B",
            "SAFE (Green)": "#10B981"
        },
        hole=0.5,
        title="Regional Risk Category Breakdown"
    )
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#1E293B",
        plot_bgcolor="#0F172A",
        height=300
    )
    st.plotly_chart(fig, use_container_width=True)
