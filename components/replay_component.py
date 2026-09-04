"""
SANKET Historical Event Timeline Replay & Comparison Component
Allows operators to replay severe weather disasters and evaluate
"Then vs Now".
"""
import time
import streamlit as st
import plotly.graph_objects as go
import config


def render_historical_replay(historical_events: dict):
    """Renders Historical Replay timeline with Play/Pause animation."""
    st.markdown("## ⏪ Historical Severe Weather Event Replay Simulator")
    st.markdown(
        "Select a past severe weather disaster to observe how SANKET's "
        "XGBoost nowcasting model predicts risk evolution."
    )

    event_keys = list(historical_events.keys())
    event_options = {k: historical_events[k]["title"] for k in event_keys}

    selected_event_key = st.selectbox(
        "Select Historical Severe Weather Event:",
        options=event_keys,
        format_func=lambda x: event_options[x]
    )

    event_data = historical_events[selected_event_key]
    timesteps = event_data["timesteps"]

    st.info(
        f"**Context:** {event_data['summary']} | "
        f"**Date:** {event_data['date']} | "
        f"**Region:** {event_data['location']}"
    )

    if "replay_step_idx" not in st.session_state:
        st.session_state.replay_step_idx = 0
    if "is_playing" not in st.session_state:
        st.session_state.is_playing = False

    c_ctrl1, c_ctrl2, c_ctrl3, c_ctrl4 = st.columns([1, 1, 1.5, 4.5])

    with c_ctrl1:
        play_label = (
            "▶️ Play" if not st.session_state.is_playing else "⏸️ Pause"
        )
        if st.button(play_label, use_container_width=True):
            st.session_state.is_playing = not st.session_state.is_playing

    with c_ctrl2:
        if st.button("⏮️ Reset", use_container_width=True):
            st.session_state.replay_step_idx = 0
            st.session_state.is_playing = False

    with c_ctrl3:
        speed = st.select_slider(
            "Playback Speed", options=["1x", "2x", "5x"], value="1x"
        )
        delay_map = {"1x": 1.5, "2x": 0.8, "5x": 0.3}
        step_delay = delay_map[speed]

    with c_ctrl4:
        selected_step_idx = st.select_slider(
            "Timeline Navigation",
            options=list(range(len(timesteps))),
            format_func=lambda i: (
                f"{timesteps[i]['time_label']} "
                f"({timesteps[i]['timestamp']})"
            ),
            value=st.session_state.replay_step_idx
        )
        st.session_state.replay_step_idx = selected_step_idx

    if st.session_state.is_playing:
        if st.session_state.replay_step_idx < len(timesteps) - 1:
            time.sleep(step_delay)
            st.session_state.replay_step_idx += 1
            st.rerun()
        else:
            st.session_state.is_playing = False

    current_step = timesteps[st.session_state.replay_step_idx]

    alert_lvl = current_step["alert_level"]
    alert_color = config.RISK_COLORS.get(alert_lvl, "#10B981")

    card_html = (
        f'<div style="background-color: #1E293B; '
        f'border-left: 6px solid {alert_color}; '
        f'padding: 16px; border-radius: 8px; margin: 12px 0;">'
        f'<div style="display: flex; justify-content: space-between; '
        f'align-items: center;">'
        f'<div>'
        f'<span style="font-size: 20px; font-weight: bold; '
        f'color: #F8FAFC;">'
        f'{current_step["time_label"]} ({current_step["timestamp"]})'
        f'</span>'
        f'<span style="background-color: {alert_color}; color: white; '
        f'padding: 4px 10px; border-radius: 12px; font-weight: bold; '
        f'margin-left: 12px;">'
        f'{alert_lvl} ALERT'
        f'</span>'
        f'</div>'
        f'<div style="font-size: 22px; font-weight: 800; '
        f'color: {alert_color};">'
        f'Risk Score: {current_step["overall_risk_pct"]}%'
        f'</div>'
        f'</div>'
        f'<div style="color: #CBD5E1; margin-top: 8px; font-size: 14px;">'
        f'<b>Geospatial Status:</b> {current_step["risk_zone_status"]}'
        f'</div>'
        f'</div>'
    )
    st.markdown(card_html, unsafe_allow_html=True)

    sm1, sm2, sm3, sm4 = st.columns(4)
    sm1.metric("Integrated Water Vapor", f"{current_step['iwv']} kg/m²")
    sm2.metric("CAPE Energy", f"{current_step['cape']} J/kg")
    sm3.metric("CTT Cooling Rate", f"-{current_step['ctt_drop']} °C/h")
    sm4.metric("Rainfall Intensity", f"{current_step['rainfall']} mm/h")

    st.markdown("---")

    st.markdown(
        "### ⚖️ Then vs Now: Ground Actuals vs SANKET XGBoost Predictions"
    )

    time_labels = [t["time_label"] for t in timesteps]
    actual_rain = [t["actual_observed_rain"] for t in timesteps]
    xgb_rain = [t["xgb_predicted_rain"] for t in timesteps]
    risk_scores = [t["overall_risk_pct"] for t in timesteps]

    fig_comp = go.Figure()

    fig_comp.add_trace(go.Bar(
        x=time_labels, y=actual_rain,
        name="Historical Ground Gauge Rain (mm/h)",
        marker_color="#38BDF8", opacity=0.7
    ))

    fig_comp.add_trace(go.Scatter(
        x=time_labels, y=xgb_rain,
        name="SANKET XGBoost Predicted Rain (mm/h)",
        line=dict(color="#F43F5E", width=4),
        mode="lines+markers"
    ))

    fig_comp.add_trace(go.Scatter(
        x=time_labels, y=risk_scores,
        name="SANKET Risk Score (%)",
        line=dict(color="#F59E0B", width=3, dash="dash"),
        yaxis="y2"
    ))

    fig_comp.update_layout(
        title=f"Nowcast Lead-Time Accuracy ({event_data['title']})",
        xaxis_title="Event Timeline Progression",
        yaxis=dict(
            title="Rainfall Intensity (mm/h)",
            titlefont=dict(color="#38BDF8")
        ),
        yaxis2=dict(
            title="Nowcast Risk Level (%)",
            titlefont=dict(color="#F59E0B"),
            overlaying="y", side="right"
        ),
        template="plotly_dark",
        paper_bgcolor="#1E293B",
        plot_bgcolor="#0F172A",
        height=400,
        legend=dict(
            orientation="h", yanchor="bottom", y=1.05,
            xanchor="right", x=1
        )
    )

    st.plotly_chart(fig_comp, use_container_width=True)
