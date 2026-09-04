"""
SANKET AI Explainability & SHAP Feature Attribution Panel
Translates complex atmospheric ML predictions into plain English.
"""
import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import config


def render_explainability_panel(
    prediction_data: dict,
    _features: dict = None
):
    """Renders SHAP charts and plain English feature cards."""
    st.markdown("## 🔍 AI Model Explainability & SHAP Feature Attribution")
    st.markdown(
        "Understand *why* SANKET issued this severe weather nowcast. "
        "Below is the breakdown of top atmospheric drivers."
    )

    shap_values = prediction_data.get("shap_values", [])
    alert_level = prediction_data.get("alert_level", "GREEN")

    if not shap_values:
        st.warning("No SHAP feature attributions available for inputs.")
        return

    col_exp1, col_exp2 = st.columns([1.2, 1])

    # 1. SHAP Feature Attribution Bar Chart
    with col_exp1:
        st.markdown("### 📈 Top Feature Contributions (SHAP Values)")

        df_shap = pd.DataFrame(shap_values)
        df_shap["display_name"] = df_shap["feature_key"].apply(
            lambda k: config.FEATURE_TRANSLATIONS.get(k, {}).get("name", k)
        )

        df_shap_sorted = df_shap.sort_values(
            by="shap_value", ascending=True
        )

        colors = [
            "#EF4444" if v >= 0 else "#10B981"
            for v in df_shap_sorted["shap_value"]
        ]

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

        min_range = max(0, round(risk_score - uncertainty, 1))
        max_range = min(100, round(risk_score + uncertainty, 1))
        esc_thresh = (
            config.THRESHOLD_HIGH if alert_level == 'RED'
            else config.THRESHOLD_MODERATE
        )

        card_logic_html = (
            f'<div style="background-color: #1E293B; padding: 16px; '
            f'border-radius: 8px; border: 1px solid #334155;">'
            f'<div style="font-size: 14px; color: #94A3B8; '
            f'font-weight: 600;">'
            f'NOWCAST CONFIDENCE INTERVAL'
            f'</div>'
            f'<div style="font-size: 28px; font-weight: 800; '
            f'color: #38BDF8; margin-top: 4px;">'
            f'{conf}% Confidence'
            f'</div>'
            f'<div style="font-size: 13px; color: #CBD5E1; '
            f'margin-top: 4px;">'
            f'Expected Risk Range: <b>[{min_range}% — {max_range}%]</b>'
            f'</div>'
            f'<hr style="margin: 10px 0; border-top: 1px solid #334155;">'
            f'<div style="font-size: 13px; color: #F8FAFC;">'
            f'<b>Why {alert_level} Alert Was Triggered:</b><br>'
            f'• XGBoost ensemble detected moisture convergence '
            f'(IWV) and rapid cloud top thermal drop.<br>'
            f'• Combined instability exceeded '
            f'<b>{esc_thresh}%</b> threshold.'
            f'</div>'
            f'</div>'
        )
        st.markdown(card_logic_html, unsafe_allow_html=True)

    st.markdown("---")

    # 3. Plain English Feature Translation Cards
    st.markdown("### 🗣️ Plain-English Atmospheric Feature Explanations")
    st.markdown(
        "Translating raw satellite and meteorological parameters into "
        "operational insights:"
    )

    card_cols = st.columns(3)

    for idx, item in enumerate(shap_values[:6]):
        col_target = card_cols[idx % 3]
        feat_key = item["feature_key"]
        val = item["value"]
        shap_v = item["shap_value"]

        info = config.FEATURE_TRANSLATIONS.get(feat_key, {
            "name": feat_key,
            "high": "Significant atmospheric impact observed.",
            "low": "Low impact observed.",
            "unit": ""
        })

        impact_color = "#EF4444" if shap_v >= 0 else "#10B981"
        impact_lbl = (
            f"+{shap_v}% Risk" if shap_v >= 0 else f"{shap_v}% Risk"
        )
        desc_text = info['high'] if val > 0 else info.get('low', '')
        unit_str = info.get('unit', '')

        feature_card_html = (
            f'<div style="background-color: #1E293B; '
            f'border-top: 4px solid {impact_color}; padding: 14px; '
            f'border-radius: 6px; margin-bottom: 12px; height: 170px;">'
            f'<div style="display: flex; justify-content: space-between; '
            f'align-items: flex-start;">'
            f'<span style="font-weight: 700; color: #F8FAFC; '
            f'font-size: 14px;">{info["name"]}</span>'
            f'<span style="background-color: {impact_color}; '
            f'color: white; '
            f'padding: 2px 6px; border-radius: 4px; font-size: 11px; '
            f'font-weight: bold;">{impact_lbl}</span>'
            f'</div>'
            f'<div style="font-size: 18px; font-weight: 800; '
            f'color: #38BDF8; margin: 6px 0;">'
            f'{val} {unit_str}'
            f'</div>'
            f'<div style="font-size: 12px; color: #CBD5E1; '
            f'line-height: 1.4;">'
            f'"{desc_text}"'
            f'</div>'
            f'</div>'
        )

        with col_target:
            st.markdown(feature_card_html, unsafe_allow_html=True)
