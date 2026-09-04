"""
SANKET Infrastructure Asset Vulnerability Tracking Component
Monitors high-value infrastructure assets (substations, telecom towers,
construction sites, flood hot-spots) against severe weather threats.
"""
import streamlit as st
import pandas as pd
import config


def render_asset_monitoring(assets_list: list):
    """Renders Infrastructure Asset Tracking table, filters, and CSV export."""
    st.markdown("## 🏢 Infrastructure Asset Vulnerability Tracker")
    st.markdown(
        "Monitor real-time severe weather exposure across high-value civic "
        "and industrial assets."
    )

    if not assets_list:
        st.warning("No asset telemetry available.")
        return

    df_assets = pd.DataFrame(assets_list)

    # 1. Asset Category & Risk Filter Controls
    c_flt1, c_flt2, c_flt3 = st.columns([1.5, 1.5, 2])

    with c_flt1:
        categories = ["All Categories"] + sorted(list(df_assets["category"].unique()))
        selected_cat = st.selectbox("Filter by Asset Category:", categories)

    with c_flt2:
        risks = ["All Risk Levels", "HIGH", "MODERATE", "YELLOW", "SAFE"]
        selected_risk = st.selectbox("Filter by Risk Severity:", risks)

    with c_flt3:
        search_query = st.text_input("🔍 Search Asset Name or Location:", "")

    # Apply Filters
    df_filtered = df_assets.copy()
    if selected_cat != "All Categories":
        df_filtered = df_filtered[df_filtered["category"] == selected_cat]
    if selected_risk != "All Risk Levels":
        df_filtered = df_filtered[df_filtered["current_risk"] == selected_risk]
    if search_query:
        df_filtered = df_filtered[
            df_filtered["name"].str.contains(search_query, case=False) |
            df_filtered["address"].str.contains(search_query, case=False)
        ]

    st.markdown(f"**Showing {len(df_filtered)} of {len(df_assets)} Monitored Assets**")

    # 2. Asset Risk Cards View
    for _, asset in df_filtered.iterrows():
        risk_color = config.RISK_COLORS.get(asset["current_risk"], "#10B981")

        with st.container():
            st.markdown(f"""
            <div style="background-color: #1E293B; border-left: 5px solid {risk_color};
                        padding: 14px; border-radius: 6px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 16px; font-weight: 800; color: #F8FAFC;">
                            {asset['name']}
                        </span>
                        <span style="background-color: #334155; color: #94A3B8; font-size: 11px;
                                    padding: 2px 8px; border-radius: 4px; margin-left: 8px;">
                            {asset['category']}
                        </span>
                    </div>
                    <div>
                        <span style="background-color: {risk_color}; color: white; padding: 4px 10px;
                                    border-radius: 4px; font-weight: bold; font-size: 12px;">
                            {asset['current_risk']} ({asset['risk_pct']}%)
                        </span>
                    </div>
                </div>
                <div style="color: #94A3B8; font-size: 12px; margin-top: 4px;">
                    📍 {asset['address']} | Coords: [{asset['lat']}, {asset['lon']}]
                </div>
                <hr style="margin: 8px 0; border-top: 1px solid #334155;">
                <div style="display: flex; gap: 20px; font-size: 13px; color: #CBD5E1;">
                    <span><b>Vulnerability Index:</b> <span style="color: #F59E0B;">
                        {asset['vulnerability_score']} / 10
                    </span></span>
                    <span><b>Est. Submerge Depth:</b> <span style="color: #60A5FA;">
                        {asset['submerge_depth_est_m']} meters
                    </span></span>
                    <span><b>Elevation ASL:</b> {asset['elevation_m']} meters</span>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #F8FAFC;
                            background-color: #0F172A; padding: 8px; border-radius: 4px;">
                    🛡️ <b>Recommended Operational Action:</b> {asset['action']}
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # 3. Export Report Options
    csv_data = df_filtered.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Export Asset Risk CSV Report",
        data=csv_data,
        file_name=f"sanket_asset_risk_report_{pd.Timestamp.now().strftime('%Y%m%d')}.csv",
        mime="text/csv"
    )
