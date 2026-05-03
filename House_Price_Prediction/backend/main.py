from datetime import datetime
import os
import sqlite3
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ==============================
# PATH CONFIG
# ==============================
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(ROOT_DIR, "models", "model_package.joblib")
DB_PATH = os.path.join(os.path.dirname(__file__), "predictions.db")


# ==============================
# APP INIT
# ==============================
app = FastAPI(title="House Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# SCHEMAS
# ==============================
class PredictRequest(BaseModel):
    TotalArea: float = Field(..., gt=0)
    OverallQual: int = Field(..., ge=1, le=10)
    Neighborhood: str
    YearBuilt: int = Field(..., gt=1800)
    TotalBathrooms: float = Field(..., ge=0)
    GarageCars: int = Field(..., ge=0)
    ExterQual: str
    BsmtQual: str


class HistoryItem(BaseModel):
    id: int
    predicted_price: float
    TotalArea: float
    Neighborhood: str
    created_at: str


class ModelInfoResponse(BaseModel):
    model: str
    rmse: float
    train_time: str


# ==============================
# GLOBALS
# ==============================
pipeline = None
model_metadata: dict[str, Any] = {}
expected_features: list[str] = []


# ==============================
# DB HELPER
# ==============================
def execute_query(query: str, params: tuple = (), fetch: bool = False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, params)

    result = cur.fetchall() if fetch else None

    conn.commit()
    conn.close()
    return result


def init_db():
    execute_query(
        """
        CREATE TABLE IF NOT EXISTS PredictionHistory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            TotalArea REAL,
            OverallQual INTEGER,
            Neighborhood TEXT,
            YearBuilt INTEGER,
            TotalBathrooms REAL,
            GarageCars INTEGER,
            ExterQual TEXT,
            BsmtQual TEXT,
            predicted_price REAL,
            timestamp TEXT
        )
        """
    )


def fetch_history():
    rows = execute_query(
        """
        SELECT id, predicted_price, TotalArea, Neighborhood, timestamp AS created_at
        FROM PredictionHistory
        ORDER BY id DESC
        """,
        fetch=True,
    )
    return [dict(row) for row in rows]


# ==============================
# STARTUP
# ==============================
@app.on_event("startup")
def load_model_and_db():
    global pipeline, expected_features, model_metadata

    init_db()

    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found: {MODEL_PATH}")

    model_package = joblib.load(MODEL_PATH)

    if isinstance(model_package, dict):
        pipeline = model_package.get("pipeline", model_package)
        model_metadata = model_package.get("metadata", {})
    else:
        pipeline = model_package
        model_metadata = {}

    expected_features = list(getattr(pipeline, "feature_names_in_", []))


# ==============================
# PREDICT
# ==============================
@app.post("/predict")
def predict(req: PredictRequest):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model chưa load")

    input_dict = req.model_dump()

    current_year = datetime.utcnow().year
    house_age = max(0, current_year - input_dict["YearBuilt"])

    if expected_features:
        full_row = {
            col: (
                input_dict[col]
                if col in input_dict
                else house_age
                if col == "HouseAge"
                else np.nan
            )
            for col in expected_features
        }
    else:
        full_row = input_dict.copy()
        full_row["HouseAge"] = house_age

    try:
        df = pd.DataFrame([full_row])
        pred = pipeline.predict(df)
        predicted_price = float(np.expm1(pred[0]))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model error: {exc}")

    # Save history
    try:
        execute_query(
            """
            INSERT INTO PredictionHistory 
            (TotalArea, OverallQual, Neighborhood, YearBuilt, TotalBathrooms, GarageCars, ExterQual, BsmtQual, predicted_price, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                input_dict["TotalArea"],
                input_dict["OverallQual"],
                input_dict["Neighborhood"],
                input_dict["YearBuilt"],
                input_dict["TotalBathrooms"],
                input_dict["GarageCars"],
                input_dict["ExterQual"],
                input_dict["BsmtQual"],
                predicted_price,
                datetime.utcnow().isoformat(),
            ),
        )
    except Exception as e:
        print(f"DB error: {e}")

    return {
        "predicted_price": predicted_price,
        "inputs": input_dict,
    }


# ==============================
# HISTORY
# ==============================
@app.get("/history", response_model=list[HistoryItem])
def get_history():
    return [HistoryItem(**row) for row in fetch_history()]


# ==============================
# MODEL INFO
# ==============================
@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    if not model_metadata:
        raise HTTPException(status_code=404, detail="No metadata")

    return ModelInfoResponse(
        model=str(model_metadata.get("model_type") or "Unknown"),
        rmse=float(model_metadata.get("cv_rmse") or 0.0),
        train_time=str(model_metadata.get("date_trained") or ""),
    )


# ==============================
# HEALTH CHECK
# ==============================
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": pipeline is not None,
        "expected_feature_count": len(expected_features),
    }