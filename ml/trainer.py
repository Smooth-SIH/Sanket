"""
SANKET Model Training & Model Serialization Module
Trains XGBoost nowcasting model and RandomForest hazard models
(storm, cloudburst, flash flood).
"""
import os
import pickle
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


def train_and_save_model(model_path="ml/xgboost_sanket_model.pkl"):
    """Trains XGBoost model on synthetic dataset and serializes to disk."""
    try:
        import xgboost as xgb
        from ml.predictor import SanketWeatherPredictor

        predictor_inst = SanketWeatherPredictor()
        # pylint: disable=protected-access
        x_tr, y_tr = predictor_inst._generate_physics_training_data(
            n_samples=2000
        )

        model = xgb.XGBRegressor(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        model.fit(x_tr, y_tr)

        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        with open(model_path, "wb") as f:
            pickle.dump(model, f)

        print(f"[SUCCESS] Trained SANKET XGBoost Model saved to {model_path}")
        return True
    except Exception as e:  # pylint: disable=broad-exception-caught
        print(f"[WARNING] Could not train native XGBoost model: {e}")
        return False


def train_reference_models(data_path="data/training_data.csv"):
    """
    Trains storm, cloudburst, and flash flood RandomForest models.
    """
    if not os.path.exists(data_path):
        print(f"[WARNING] Training data path {data_path} not found.")
        return False

    df = pd.read_csv(data_path)
    features = [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "precipitation",
        "cape",
        "convective_inhibition"
    ]

    x_features = df[features]

    # 1. Storm Model
    if "storm" in df.columns:
        y_storm = df["storm"]
        x_tr, x_te, y_tr, y_te = train_test_split(
            x_features, y_storm, test_size=0.2, random_state=42
        )
        storm_model = RandomForestClassifier(
            n_estimators=100, random_state=42
        )
        storm_model.fit(x_tr, y_tr)
        acc = accuracy_score(y_te, storm_model.predict(x_te))
        joblib.dump(storm_model, "storm_model.pkl")
        os.makedirs("ml/models", exist_ok=True)
        joblib.dump(storm_model, "ml/models/storm_model.pkl")
        print(f"[SUCCESS] Trained Storm Model (Accuracy: {acc*100:.2f}%)")

    # 2. Cloudburst Model
    if "cloudburst" in df.columns:
        y_cb = df["cloudburst"]
        x_tr, x_te, y_tr, y_te = train_test_split(
            x_features, y_cb, test_size=0.2, random_state=42, stratify=y_cb
        )
        cb_model = RandomForestClassifier(
            n_estimators=100, random_state=42
        )
        cb_model.fit(x_tr, y_tr)
        acc = accuracy_score(y_te, cb_model.predict(x_te))
        joblib.dump(cb_model, "cloudburst_model.pkl")
        joblib.dump(cb_model, "ml/models/cloudburst_model.pkl")
        print(
            f"[SUCCESS] Trained Cloudburst Model (Accuracy: {acc*100:.2f}%)"
        )

    # 3. Flood Model
    if "flood" in df.columns:
        y_flood = df["flood"]
        x_tr, x_te, y_tr, y_te = train_test_split(
            x_features, y_flood, test_size=0.2, random_state=42,
            stratify=y_flood
        )
        flood_model = RandomForestClassifier(
            n_estimators=100, random_state=42
        )
        flood_model.fit(x_tr, y_tr)
        acc = accuracy_score(y_te, flood_model.predict(x_te))
        joblib.dump(flood_model, "flood_model.pkl")
        joblib.dump(flood_model, "ml/models/flood_model.pkl")
        print(
            f"[SUCCESS] Trained Flash Flood Model (Accuracy: {acc*100:.2f}%)"
        )

    return True


if __name__ == "__main__":
    train_and_save_model()
    train_reference_models()
