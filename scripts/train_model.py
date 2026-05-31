"""
Train and validate EduPredict model on UCI Student Performance Dataset.
Source: https://archive.ics.uci.edu/dataset/320/student+performance

Run: python scripts/train_model.py
Outputs: public/model/model.json
"""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import cross_val_predict, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "model"
DATA_DIR = ROOT / "scripts" / "data"
MAT_URL = "https://raw.githubusercontent.com/KunjalJethwani/StudentPerformance/main/student-mat.csv"
POR_URL = "https://raw.githubusercontent.com/KunjalJethwani/StudentPerformance/main/student-por.csv"

FEATURE_NAMES = [
    "attendance",
    "previousGPA",
    "studyHoursPerWeek",
    "assignmentCompletion",
    "examScoreAvg",
    "participationScore",
    "sleepHours",
    "extracurricularHours",
    "parentalSupport",
]

RISK_THRESHOLDS = [
    ("excellent", 85),
    ("good", 70),
    ("moderate", 55),
    ("at-risk", 40),
    ("critical", 0),
]


def score_to_risk(score: float) -> str:
    for label, threshold in RISK_THRESHOLDS:
        if score >= threshold:
            return label
    return "critical"


def load_dataset() -> pd.DataFrame:
    sep = ";"
    mat_path = DATA_DIR / "student-mat.csv"
    por_path = DATA_DIR / "student-por.csv"

    if not mat_path.exists() or not por_path.exists():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(MAT_URL, mat_path)
        urllib.request.urlretrieve(POR_URL, por_path)

    mat = pd.read_csv(mat_path, sep=sep)
    por = pd.read_csv(por_path, sep=sep)
    return pd.concat([mat, por], ignore_index=True)


def map_uci_row(row: pd.Series) -> dict[str, float]:
    max_absences = 93
    attendance = max(0.0, min(100.0, 100 - (row["absences"] / max_absences) * 100))
    previous_gpa = (row["G2"] / 20.0) * 4.0
    study_hours = float(row["studytime"]) * 4.0
    assignment = max(0.0, min(100.0, 100 - row["failures"] * 25))
    exam_avg = (row["G1"] / 20.0) * 100.0
    activity_boost = 25.0 if row["activities"] == "yes" else 0.0
    participation = min(100.0, (row["famrel"] / 5.0) * 60 + activity_boost + 15)
    sleep_hours = min(12.0, max(4.0, 5.0 + row["health"] * 0.9))
    extracurricular = 8.0 if row["activities"] == "yes" else 2.0 + row["freetime"]
    edu_support = ((row["Medu"] + row["Fedu"]) / 8.0) * 50
    fam_support = 50.0 if row["famsup"] == "yes" else 20.0
    parental = min(100.0, edu_support + fam_support * 0.5)

    return {
        "attendance": round(attendance, 2),
        "previousGPA": round(previous_gpa, 2),
        "studyHoursPerWeek": round(study_hours, 2),
        "assignmentCompletion": round(assignment, 2),
        "examScoreAvg": round(exam_avg, 2),
        "participationScore": round(participation, 2),
        "sleepHours": round(sleep_hours, 2),
        "extracurricularHours": round(extracurricular, 2),
        "parentalSupport": round(parental, 2),
    }


def build_training_data(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rows = []
    targets = []
    risk_labels = []

    for _, row in df.iterrows():
        mapped = map_uci_row(row)
        features = [mapped[name] for name in FEATURE_NAMES]
        target = (row["G3"] / 20.0) * 100.0
        rows.append(features)
        targets.append(target)
        risk_labels.append(score_to_risk(target))

    return np.array(rows), np.array(targets), np.array(risk_labels)


def main() -> None:
    print("Loading UCI Student Performance dataset...")
    df = load_dataset()
    X, y, risk = build_training_data(df)

    X_train, X_test, y_train, y_test, risk_train, risk_test = train_test_split(
        X, y, risk, test_size=0.2, random_state=42
    )

    reg_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", Ridge(alpha=1.0)),
    ])

    cv_r2 = cross_val_score(reg_pipeline, X, y, cv=5, scoring="r2")
    cv_mae = -cross_val_score(reg_pipeline, X, y, cv=5, scoring="neg_mean_absolute_error")
    cv_rmse = np.sqrt(-cross_val_score(reg_pipeline, X, y, cv=5, scoring="neg_mean_squared_error"))

    reg_pipeline.fit(X_train, y_train)
    y_pred = reg_pipeline.predict(X_test)
    test_r2 = r2_score(y_test, y_pred)
    test_mae = mean_absolute_error(y_test, y_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    cv_preds = cross_val_predict(reg_pipeline, X, y, cv=5)
    cv_full_mae = mean_absolute_error(y, cv_preds)
    cv_full_rmse = np.sqrt(mean_squared_error(y, cv_preds))
    cv_full_r2 = r2_score(y, cv_preds)

    risk_pred_test = [score_to_risk(p) for p in y_pred]
    risk_acc = accuracy_score(risk_test, risk_pred_test)

    clf_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=2000)),
    ])
    clf_cv_acc = cross_val_score(clf_pipeline, X, risk, cv=5, scoring="accuracy")
    clf_pipeline.fit(X_train, risk_train)
    clf_test_acc = accuracy_score(risk_test, clf_pipeline.predict(X_test))

    scaler: StandardScaler = reg_pipeline.named_steps["scaler"]
    regressor: Ridge = reg_pipeline.named_steps["regressor"]

    residual_std = float(np.std(y - reg_pipeline.predict(X)))

    report = classification_report(risk_test, risk_pred_test, output_dict=True, zero_division=0)

    model_payload = {
        "version": "2.0.0",
        "algorithm": "Ridge Regression (L2-regularized linear model)",
        "dataset": {
            "name": "UCI Student Performance Data Set",
            "source": "https://archive.ics.uci.edu/dataset/320/student+performance",
            "citation": "Cortez and Silva (2008). Using Data Mining To Predict Secondary School Student Performance.",
            "samples": int(len(df)),
            "subjects": ["Mathematics", "Portuguese"],
            "institution": "Secondary schools, Portugal",
        },
        "features": FEATURE_NAMES,
        "featureDescriptions": {
            "attendance": "Class attendance percentage (mapped from absence records)",
            "previousGPA": "Previous term GPA on 4.0 scale (mapped from G2 grade)",
            "studyHoursPerWeek": "Weekly study hours (mapped from study time scale)",
            "assignmentCompletion": "Assignment completion % (inverse of past course failures)",
            "examScoreAvg": "Average exam score % (mapped from G1 grade)",
            "participationScore": "Class participation (family relationship + activities)",
            "sleepHours": "Average sleep hours (mapped from health indicator)",
            "extracurricularHours": "Weekly extracurricular hours",
            "parentalSupport": "Parental support index (education level + family support)",
        },
        "target": "Final course grade (G3) normalized to 0-100 percentage",
        "scaler": {
            "mean": scaler.mean_.tolist(),
            "std": scaler.scale_.tolist(),
        },
        "regression": {
            "intercept": float(regressor.intercept_),
            "coefficients": regressor.coef_.tolist(),
        },
        "riskThresholds": {label: threshold for label, threshold in RISK_THRESHOLDS},
        "validation": {
            "methodology": "80/20 train-test split + 5-fold cross-validation on full dataset",
            "crossValidation": {
                "folds": 5,
                "r2Mean": round(float(cv_r2.mean()), 4),
                "r2Std": round(float(cv_r2.std()), 4),
                "maeMean": round(float(cv_mae.mean()), 4),
                "maeStd": round(float(cv_mae.std()), 4),
                "rmseMean": round(float(cv_rmse.mean()), 4),
                "rmseStd": round(float(cv_rmse.std()), 4),
            },
            "holdoutTest": {
                "r2": round(float(test_r2), 4),
                "mae": round(float(test_mae), 4),
                "rmse": round(float(test_rmse), 4),
                "riskClassificationAccuracy": round(float(risk_acc), 4),
            },
            "fullDatasetCV": {
                "r2": round(float(cv_full_r2), 4),
                "mae": round(float(cv_full_mae), 4),
                "rmse": round(float(cv_full_rmse), 4),
            },
            "riskClassifier": {
                "algorithm": "Multinomial Logistic Regression",
                "cvAccuracyMean": round(float(clf_cv_acc.mean()), 4),
                "cvAccuracyStd": round(float(clf_cv_acc.std()), 4),
                "holdoutAccuracy": round(float(clf_test_acc), 4),
            },
            "residualStdDev": round(residual_std, 4),
            "classificationReport": report,
            "interpretation": {
                "r2": "Proportion of grade variance explained by the model (0-1, higher is better)",
                "mae": "Mean Absolute Error in percentage points on final grade prediction",
                "rmse": "Root Mean Square Error — penalizes large prediction errors",
                "riskAccuracy": "How often predicted risk tier matches actual outcome tier",
            },
        },
        "trainedAt": pd.Timestamp.utcnow().isoformat(),
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / "model.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(model_payload, f, indent=2)

    print(f"\nModel saved to {out_path}")
    print(f"Samples: {len(df)}")
    print(f"5-Fold CV R2:  {cv_r2.mean():.4f} (+/- {cv_r2.std():.4f})")
    print(f"5-Fold CV MAE: {cv_mae.mean():.2f}% (+/- {cv_mae.std():.2f})")
    print(f"Holdout R2:    {test_r2:.4f}")
    print(f"Holdout MAE:   {test_mae:.2f}%")
    print(f"Risk Accuracy: {risk_acc:.2%}")


if __name__ == "__main__":
    main()
