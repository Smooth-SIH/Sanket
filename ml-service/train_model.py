"""
SANKET XGBoost Severe Weather Nowcast Model Training Pipeline.
Trains an XGBoost classifier on historical weather observations (data/training_data.csv)
and saves the serialized model artifact for the FastAPI ml-service.
"""

import os
import math
from pathlib import Path
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

# Paths: relative to ml-service directory
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "training_data.csv"
MODEL_OUTPUT_DIR = BASE_DIR / "models"
MODEL_OUTPUT_PATH = MODEL_OUTPUT_DIR / "xgb_nowcast.json"

FEATURE_NAMES = [
    'IWV_mm',          # Integrated Water Vapor (mm)
    'CTT_K',           # Cloud Top Temperature (Kelvin)
    'CAPE_Jkg',        # Convective Available Potential Energy (J/kg)
    'CIN_Jkg',         # Convective Inhibition (J/kg)
    'wind_speed_kmh',   # Wind Speed (km/h)
    'humidity_pct',    # Relative Humidity (%)
    'rain_rate_mmh',   # Current Rain Rate (mm/h)
    'lifted_index',    # Lifted Index
    'k_index'          # K-Index
]


def derive_features(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Derive atmospheric features required by SANKET nowcasting engine."""
    df = raw_df.copy()

    temp = df['temperature_2m'].astype(float)
    humidity = df['relative_humidity_2m'].astype(float)
    wind = df['wind_speed_10m'].astype(float)
    rain = df['precipitation'].astype(float)
    cape = df['cape'].astype(float)
    cin = df['convective_inhibition'].astype(float).abs()

    # Calculate Dew Point (Magnus formula)
    a, b = 17.27, 237.7
    alpha = ((a * temp) / (b + temp)) + np.log(humidity / 100.0)
    dew_point = (b * alpha) / (a - alpha)

    # Integrated Water Vapor (IWV in mm)
    iwv = np.clip((0.14 * (dew_point + 273.15) - 15.0) + (humidity / 100.0) * 15.0, 15.0, 85.0)

    # Cloud Top Temperature (CTT in Kelvin)
    # Deep convective clouds with high CAPE & heavy rain have very cold CTT (< 220 K)
    temp_k = temp + 273.15
    ctt = np.where(
        (cape > 1500) | (rain > 20),
        210.0 - np.clip((cape - 1500) / 200.0, 0, 20),
        temp_k - (humidity * 0.4) - 15.0
    )
    ctt = np.clip(ctt, 190.0, 285.0)

    # Lifted Index approximation
    lifted_idx = np.where(cape > 500, -(cape / 450.0), 1.5 - (humidity / 50.0))

    # K-Index approximation
    k_index = 20.0 + (temp - dew_point) * 0.5 + (humidity * 0.2)

    features_df = pd.DataFrame({
        'IWV_mm': np.round(iwv, 2),
        'CTT_K': np.round(ctt, 2),
        'CAPE_Jkg': np.round(cape, 1),
        'CIN_Jkg': np.round(cin, 1),
        'wind_speed_kmh': np.round(wind, 1),
        'humidity_pct': np.round(humidity, 1),
        'rain_rate_mmh': np.round(rain, 2),
        'lifted_index': np.round(lifted_idx, 2),
        'k_index': np.round(k_index, 1)
    })

    return features_df


def train_and_save():
    print(f"[1/4] Loading dataset from {DATA_PATH}...")
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

    raw_df = pd.read_csv(DATA_PATH)
    print(f"      Loaded {len(raw_df)} historical records.")

    print("[2/4] Engineering atmospheric & satellite sounding features...")
    X = derive_features(raw_df)
    y = raw_df['flood'].astype(int)

    # Class distribution
    pos = y.sum()
    neg = len(y) - pos
    print(f"      Class distribution: Severe/Flood={pos}, Normal={neg}")

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if pos > 1 else None
    )

    print("[3/4] Fitting XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[Validation Results]")
    print(f"Accuracy: {acc * 100:.2f}%")
    print(f"Classification Report:\n{classification_report(y_test, y_pred, zero_division=0)}")

    print(f"[4/4] Saving model artifact to {MODEL_OUTPUT_PATH}...")
    MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODEL_OUTPUT_PATH))
    print("SUCCESS: XGBoost model trained and saved successfully in ml-service/models!")


if __name__ == "__main__":
    train_and_save()
