"""
SHAP TreeExplainer engine for feature attribution calculations.
"""

import numpy as np
import pandas as pd
import shap
from model import nowcast_model


class ShapExplainabilityEngine:
    """Calculates SHAP attributions for weather observations."""

    def __init__(self):
        self.model = nowcast_model.model
        self.feature_names = nowcast_model.feature_names
        self.explainer = shap.TreeExplainer(self.model)

    def explain_instance(self, features_dict: dict) -> dict:
        """
        Generates SHAP waterfall / bar breakdown for an observation.
        """
        input_data = []
        for name in self.feature_names:
            fallback_name = name.split('_', 1)[0]
            val = features_dict.get(
                name, features_dict.get(fallback_name, 0.0)
            )
            input_data.append(float(val))

        df_input = pd.DataFrame([input_data], columns=self.feature_names)
        shap_values = self.explainer.shap_values(df_input)

        if isinstance(shap_values, list):
            sv_arr = shap_values[1][0]
        elif len(shap_values.shape) == 3:
            sv_arr = shap_values[0, :, 1]
        else:
            sv_arr = shap_values[0]

        attributions = []
        if isinstance(self.explainer.expected_value, (list, np.ndarray)):
            base_val = float(self.explainer.expected_value[1])
        else:
            base_val = float(self.explainer.expected_value)

        for name, val, shap_val in zip(self.feature_names, input_data, sv_arr):
            attributions.append({
                'feature': str(name),
                'value': float(round(float(val), 2)),
                'shap_value': float(round(float(shap_val), 4)),
                'impact': 'Increase Risk' if shap_val > 0 else 'Decrease Risk'
            })

        attributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)

        return {
            'base_value': float(round(float(base_val), 4)),
            'prediction_shap_sum': float(round(float(sum(sv_arr)), 4)),
            'feature_attributions': attributions
        }


shap_engine = ShapExplainabilityEngine()
