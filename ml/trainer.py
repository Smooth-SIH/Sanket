"""
SANKET Model Training & Model Serialization Module
"""
import os
import pickle


def train_and_save_model(model_path="ml/xgboost_sanket_model.pkl"):
    """Trains XGBoost model on synthetic dataset and serializes to disk."""
    try:
        import xgboost as xgb
        from ml.predictor import SanketWeatherPredictor

        predictor_inst = SanketWeatherPredictor()
        X_tr, y_tr = predictor_inst._generate_physics_training_data(
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
        model.fit(X_tr, y_tr)

        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        with open(model_path, "wb") as f:
            pickle.dump(model, f)

        print(f"[SUCCESS] Trained SANKET XGBoost Model saved to {model_path}")
        return True
    except Exception as e:
        print(f"[WARNING] Could not train native XGBoost model: {e}")
        return False


if __name__ == "__main__":
    train_and_save_model()
