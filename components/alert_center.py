"""
SANKET Alert Center & Emergency Management Component
Displays active alerts, operational playbooks, alert acknowledgment tracking,
and severity analytics.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import config


def render_alert_center(alerts_feed: list):
    """Renders Emergency Alert Feed, Playbooks, and Acknowledgment workflow."""
    st.markdown("## 🚨 Emergency Alert Center & Incident Playbooks")
    st.markdown(
        "Real-time disaster management dispatch dashboard for civic authorities, "
        "utility operators, and emergency response teams."
    )

    # Initialize Session State for Alert Acknowledgments if not set
    if "ack_alerts" not in st.session_state:
        st.session_state.ack_alerts = set()

    # Calculate Summary Stats
    total_alerts = len(alerts_feed)
    red_cnt = sum(1 for a in alerts_feed if a["severity"] == "RED")
    orange_cnt = sum(1 for a in alerts_feed if a["severity"] == "ORANGE")
    yellow_cnt = sum(1 for a in alerts_feed if a["severity"] == "YELLOW")
    ack_cnt = sum(
        1 for a in alerts_feed
        if a["id"] in st.session_state.ack_alerts or a.get("acknowledged")
    )

    # Top Alert Stats Cards
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Total Active Alerts", total_alerts)
    c2.metric(
        "Critical RED Alerts", red_cnt,
        delta="Immediate Action" if red_cnt > 0 else "Clear",
        delta_color="inverse"
    )
    c3.metric("ORANGE Warnings", orange_cnt)
    c4.metric("YELLOW Advisories", yellow_cnt)
    c5.metric("Acknowledged", f"{ack_cnt} / {total_alerts}")

    st.markdown("---")

    # Main Alert Center Split: Active Feed + Incident Playbook
    col_feed, col_playbook = st.columns([1.3, 1])

    with col_feed:
        st.markdown("### 🔔 Active Incident Notifications")

        for alert in alerts_feed:
            alert_id = alert["id"]
            severity = alert["severity"]
            badge_color = config.RISK_COLORS.get(severity, "#10B981")
            is_ack = (
                alert_id in st.session_state.ack_alerts or
                alert.get("acknowledged", False)
            )

            with st.container():
                st.markdown(f"""
                <div style="background-color: #1E293B; border-left: 6px solid {badge_color};
                            padding: 14px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="background-color: {badge_color}; color: white;
                                    padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                            {severity} ALERT
                        </span>
                        <span style="color: #94A3B8; font-size: 12px;">🕒 {alert['timestamp']}</span>
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #F8FAFC; margin-top: 6px;">
                        {alert['title']}
                    </div>
                    <div style="color: #CBD5E1; font-size: 13px; margin-top: 4px;">
                        <b>Affected Zones:</b> {', '.join(alert['affected_zones'])}
                    </div>
                    <div style="display: flex; gap: 15px; margin-top: 8px; font-size: 12px; color: #94A3B8;">
                        <span>⚡ TS Risk: {alert['thunderstorm_risk_pct']}%</span>
                        <span>🌧️ Cloudburst: {alert['cloudburst_risk_pct']}%</span>
                        <span>🌊 Flash Flood: {alert['flash_flood_risk_pct']}%</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                col_btn1, _ = st.columns([2, 1])
                with col_btn1:
                    if is_ack:
                        st.success("✓ Acknowledged by Control Room", icon="✅")
                    else:
                        if st.button(
                            f"Mark Acknowledged ({alert_id})",
                            key=f"btn_ack_{alert_id}"
                        ):
                            st.session_state.ack_alerts.add(alert_id)
                            st.rerun()

    with col_playbook:
        st.markdown("### 📋 Emergency Action Playbooks")

        playbook_severity = st.radio(
            "Select Alert Level Playbook:",
            options=["RED", "ORANGE", "YELLOW", "GREEN"],
            horizontal=True
        )

        playbook = config.ALERT_PLAYBOOKS[playbook_severity]

        st.markdown(f"""
        <div style="background-color: #1E293B; border-top: 5px solid {playbook['badge_color']};
                    padding: 16px; border-radius: 8px;">
            <h4 style="color: {playbook['badge_color']}; margin-top: 0;">{playbook['title']}</h4>
            <p style="color: #CBD5E1; font-size: 13px;">{playbook['description']}</p>
            <h5 style="color: #F8FAFC; margin-bottom: 8px;">Mandatory SOP Response Steps:</h5>
        </div>
        """, unsafe_allow_html=True)

        for idx, action in enumerate(playbook["actions"], 1):
            st.markdown(f"**{idx}.** {action}")

    st.markdown("---")

    # Alert Severity Analytics Chart
    st.markdown("### 📈 Alert Severity Analytics")

    df_alerts = pd.DataFrame(alerts_feed)
    if not df_alerts.empty:
        fig_sev = px.bar(
            df_alerts,
            x="severity",
            color="severity",
            title="Alert Distribution by Severity Level",
            color_discrete_map={
                "RED": "#EF4444",
                "ORANGE": "#F97316",
                "YELLOW": "#F59E0B",
                "GREEN": "#10B981"
            }
        )
        fig_sev.update_layout(
            template="plotly_dark",
            paper_bgcolor="#1E293B",
            plot_bgcolor="#0F172A",
            height=280
        )
        st.plotly_chart(fig_sev, use_container_width=True)
