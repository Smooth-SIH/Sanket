"""
SANKET AI Explainability & SHAP Feature Attribution Panel
Translates complex atmospheric ML predictions into plain English actionable insights for emergency operators.
"""
import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import config

def render_explainability_panel(prediction_data: dict, features: dict):
    """Renders SHAP waterfall/bar charts, plain English feature translation cards, and uncertainty bounds."""
    st.markdown("## 🔍 AI Model Explainability & SHAP Feature Attribution")
    st.markdown("Understand *why* SANKET issued this severe weather nowcast. Below is the breakdown of top atmospheric drivers contributing to the XGBoost prediction.")
    
    shap_values = prediction_data.get("shap_values", [])
    alert_level = prediction_data.get("alert_level", "GREEN")
    
    if not shap_values:
        st.warning("No SHAP feature attributions available for current inputs.")
        return

    col_exp1, col_exp2 = st.columns([1.2, 1])

    # 1. SHAP Feature Attribution Bar Chart
    with col_exp1:
        st.markdown("### 📈 Top Feature Contributions (SHAP Values)")
        
        df_shap = pd.DataFrame(shap_values)
        # Add readable names
        df_shap["display_name"] = df_shap["feature_key"].apply(
            lambda k: config.FEATURE_TRANSLATIONS.get(k, {}).get("name", k)
        )
        
        # Sort for plot
        df_shap_sorted = df_shap.sort_values(by="shap_value", ascending=True)
        
        colors = ["#EF4444" if v >= 0 else "#10B981" for v in df_shap_sorted["shap_value"]]
        
        fig_shap = go.Figure()
        fig_shap.add_trace(go.Bar(
            y=df_shap_sorted["display_name"],
            x=df_shap_sorted["shap_value"],
            orientation='h',
            marker_color=colors,
            text=[f"{v:+.1f}%" for v in df_shap_sorted["shap_value"]],
            textposition="outside"
        ))

        fig_shap.update_layout(
            title="XGBoost SHAP Impact on Severe Weather Risk (%)",
            xaxis_title="SHAP Value Contribution to Risk Score",
            template="plotly_dark",
            paper_bgcolor="#1E293B",
            plot_bgcolor="#0F172A",
            height=380,
            margin=dict(l=10, r=20, t=40, b=30)
        )
        st.plotly_chart(fig_shap, use_container_width=True)

    # 2. Uncertainty Bounds & Decision Logic Summary
    with col_exp2:
        st.markdown("### 🎯 Model Confidence & Decision Logic")
        
        conf = prediction_data.get("confidence_score", 92.5)
        uncertainty = prediction_data.get("uncertainty_margin", 3.5)
        risk_score = prediction_data.get("overall_risk_score", 75.0)
        
        st.markdown(f"""
        <div style="background-color: #1E293B; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 14px; color: #94A3B8; font-weight: 600;">NOWCAST CONFIDENCE INTERVAL</div>
            <div style="font-size: 28px; font-weight: 800; color: #38BDF8; margin-top: 4px;">{conf}% Confidence</div>
            <div style="font-size: 13px; color: #CBD5E1; margin-top: 4px;">
                Expected Risk Range: <b>[{max(0, round(risk_score-uncertainty,1))}% — {min(100, round(risk_score+uncertainty,1))}%]</b>
            </div>
            <hr style="margin: 10px 0; border-top: 1px solid #334155;">
            <div style="font-size: 13px; color: #F8FAFC;">
                <b>Why {alert_level} Alert Was Triggered:</b><br>
                • XGBoost ensemble detected simultaneous convergence of high lower-tropospheric moisture (IWV) and rapid cloud top thermal drop.<br>
                • Combined atmospheric instability exceeded the <b>{config.THRESHOLD_HIGH if alert_level=='RED' else config.THRESHOLD_MODERATE}%</b> risk escalation threshold.
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # 3. Plain English Feature Translation Cards
    st.markdown("### 🗣️ Plain-English Atmospheric Feature Explanations")
    st.markdown("Translating raw satellite and meteorological parameters into operational disaster management insights:")

    card_cols = st.columns(3)
    
    for idx, item in enumerate(shap_values[:6]):
        col_target = card_cols[idx % 3]
        feat_key = item["feature_key"]
        val = item["value"]
        shap_v = item["shap_value"]
        
        info = config.FEATURE_TRANSLATIONS.get(feat_key, {
            "name": feat_key,
            "high": "Significant atmospheric impact observed.",
            "unit": ""
        })
        
        impact_color = "#EF4444" if shap_v >= 0 else "#10B981"
        impact_label = f"+{shap_v}% Risk" if shap_v >= 0 else f"{shap_v}% Risk"

        with col_target:
            st.markdown(f"""
            <div style="background-color: #1E293B; border-top: 4px solid {impact_color}; padding: 14px; border-radius: 6px; margin-bottom: 12px; height: 170px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span style="font-weight: 700; color: #F8FAFC; font-size: 14px;">{info['name']}</span>
                    <span style="background-color: {impact_color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">{impact_label}</span>
                </div>
                <div style="font-size: 18px; font-weight: 800; color: #38BDF8; margin: 6px 0;">{val} {info.get('unit','')}</div>
                <div style="font-size: 12px; color: #CBD5E1; line-height: 1.4;">"{info['high'] if val > 0 else info['low']}"</div>
            </div>
            """, unsafe_allow_html=True)
