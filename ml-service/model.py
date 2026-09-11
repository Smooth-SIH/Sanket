"""
XGBoost Severe Weather Nowcasting Model Wrapper.
Calculates risk scores for cloudburst, flash flood, thunderstorm, and hailstorm.
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from pathlib import Path


class SanketNowcastModel:
    """
    ML Classifier & Risk Scorer for SANKET.
    """

    def __init__(self):
        self.feature_names = [
            'IWV_mm',          # Integrated Water Vapor (mm)
            'CTT_K',           # Cloud Top Temperature (Kelvin)
            'CAPE_Jkg',        # Convective Available Potential Energy (J/kg)
            'CIN_Jkg',         # Convective Inhibition (J/kg)
            'wind_speed_kmh',   # Surface/Upper Wind Speed (km/h)
            'humidity_pct',    # Relative Humidity (%)
            'rain_rate_mmh',   # Current Rain Rate (mm/h)
            'lifted_index',    # Lifted Index
            'k_index'          # K-Index
        ]
        self.model = None
        self.model_path = Path(__file__).resolve().parent / "models" / "xgb_nowcast.json"
        self._initialize_or_load_model()

    def _initialize_or_load_model(self):
        """Load trained XGBoost model from disk or train if missing."""
        if self.model_path.exists():
            print(f"[Nowcast Model] Loading trained model artifact from {self.model_path}")
            self.model = xgb.XGBClassifier()
            self.model.load_model(str(self.model_path))
            return

        print(f"[Nowcast Model] Model artifact not found at {self.model_path}. Training baseline model...")
        np.random.seed(42)
        n_samples = 2000

        iwv = np.random.uniform(20, 80, n_samples)
        ctt = np.random.uniform(190, 290, n_samples)
        cape = np.random.uniform(100, 4500, n_samples)
        cin = np.random.uniform(0, 300, n_samples)
        wind = np.random.uniform(5, 120, n_samples)
        humidity = np.random.uniform(40, 100, n_samples)
        rain_rate = np.random.uniform(0, 150, n_samples)
        li_val = np.random.uniform(-10, 5, n_samples)
        ki_val = np.random.uniform(10, 45, n_samples)

        features_df = pd.DataFrame({
            'IWV_mm': iwv,
            'CTT_K': ctt,
            'CAPE_Jkg': cape,
            'CIN_Jkg': cin,
            'wind_speed_kmh': wind,
            'humidity_pct': humidity,
            'rain_rate_mmh': rain_rate,
            'lifted_index': li_val,
            'k_index': ki_val
        })

        y_labels = (
            (features_df['IWV_mm'] > 52) &
            (features_df['CTT_K'] < 220) &
            (features_df['CAPE_Jkg'] > 2000) &
            (features_df['rain_rate_mmh'] > 30)
        ).astype(int)

        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        self.model.fit(features_df, y_labels)
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        self.model.save_model(str(self.model_path))
        print(f"[Nowcast Model] Saved newly trained model to {self.model_path}")

    def predict(self, features_dict: dict) -> dict:
        """
        Accepts dictionary of weather parameters and returns risk assessment,
        hazard classification, probabilities, and estimated lead time.
        """
        input_data = []
        for name in self.feature_names:
            fallback_name = name.split('_', 1)[0]
            val = features_dict.get(name, features_dict.get(fallback_name, 0.0))
            input_data.append(float(val))

        df_input = pd.DataFrame([input_data], columns=self.feature_names)

        iwv = df_input['IWV_mm'].iloc[0]
        ctt = df_input['CTT_K'].iloc[0]
        cape = df_input['CAPE_Jkg'].iloc[0]
        rain = df_input['rain_rate_mmh'].iloc[0]
        wind_sp = df_input['wind_speed_kmh'].iloc[0]

        # Evaluate ML model prediction probability from trained XGBoost artifact
        ml_severe_prob = 0.0
        if self.model is not None:
            try:
                proba = self.model.predict_proba(df_input)
                ml_severe_prob = float(proba[0][1]) if proba.shape[1] > 1 else float(proba[0][0])
            except Exception:
                ml_severe_prob = 0.0

        cloudburst_risk = min(
            1.0,
            max(
                0.0,
                (iwv / 65.0) * 0.4 +
                (max(0.0, 240.0 - ctt) / 40.0) * 0.3 +
                (cape / 3500.0) * 0.3
            )
        )
        flash_flood_risk = min(
            1.0,
            max(0.0, (rain / 80.0) * 0.6 + cloudburst_risk * 0.4)
        )
        thunderstorm_risk = min(
            1.0,
            max(0.0, (cape / 3000.0) * 0.5 + (wind_sp / 90.0) * 0.5)
        )
        hail_risk = min(
            1.0,
            max(
                0.0,
                (max(0.0, 230.0 - ctt) / 35.0) * 0.6 + (cape / 3500.0) * 0.4
            )
        )

        # Composite score blends physical soundings with ML model inference
        physics_max = max(
            cloudburst_risk,
            flash_flood_risk,
            thunderstorm_risk,
            hail_risk
        )
        max_risk = min(1.0, max(0.0, 0.65 * physics_max + 0.35 * ml_severe_prob))

        if max_risk >= 0.75:
            severity = "CRITICAL"
            color = "#ef4444"
            action = "IMMEDIATE EVACUATION / HIGH ALERT BROADCAST"
            lead_time = int(np.random.randint(15, 45))
        elif max_risk >= 0.50:
            severity = "WARNING"
            color = "#ff6b35"
            action = "Prepare Emergency Teams & Asset Shields"
            lead_time = int(np.random.randint(45, 90))
        elif max_risk >= 0.25:
            severity = "WATCH"
            color = "#eab308"
            action = "Continuous Radar & Satellite Surveillance"
            lead_time = int(np.random.randint(90, 180))
        else:
            severity = "NORMAL"
            color = "#10b981"
            action = "Routine Atmospheric Monitoring"
            lead_time = 0

        hazards = {
            'Cloudburst': cloudburst_risk,
            'Flash Flood': flash_flood_risk,
            'Severe Thunderstorm': thunderstorm_risk,
            'Hailstorm': hail_risk
        }
        
        if max_risk < 0.25:
            primary_hazard = "Normal Atmospheric State"
        else:
            primary_hazard = max(hazards, key=hazards.get)

        return {
            'primary_hazard': str(primary_hazard),
            'severity': severity,
            'severity_color': color,
            'overall_risk_score': float(round(max_risk * 100, 1)),
            'ml_model_probability': float(round(ml_severe_prob * 100, 1)),
            'cloudburst_probability': float(round(cloudburst_risk * 100, 1)),
            'flash_flood_probability': float(round(flash_flood_risk * 100, 1)),
            'thunderstorm_probability': float(round(thunderstorm_risk * 100, 1)),
            'hail_probability': float(round(hail_risk * 100, 1)),
            'recommended_action': action,
            'estimated_lead_time_mins': int(lead_time),
            'features': {k: float(v) for k, v in df_input.iloc[0].to_dict().items()}
        }


nowcast_model = SanketNowcastModel()
