# EduPredict — Validated Student Performance Prediction System

A **research-validated** student performance prediction tool for schools and colleges. Trained on the [UCI Student Performance Dataset](https://archive.ics.uci.edu/dataset/320/student+performance) with documented accuracy metrics. Deploys to **Netlify** as a static app.

## Validation Results

| Metric | Value | Meaning |
|--------|-------|---------|
| **R² (5-Fold CV)** | 0.808 | Model explains ~81% of grade variance |
| **MAE** | 4.8% | Average prediction error on final grade |
| **Holdout R²** | 0.807 | Independent 20% test set performance |
| **Risk Tier Accuracy** | 73.7% | Correct at-risk classification rate |
| **Training Samples** | 1,044 | Real student records (Math + Portuguese) |

## Features

- **Validated ML model** — Ridge Regression trained on UCI benchmark dataset
- **Validation dashboard** — Full metrics, methodology, feature importance, citation
- **Prediction intervals** — ±RMSE confidence bounds on every prediction
- **CSV bulk import** — Import student rosters from spreadsheets
- **JSON export/import** — Backup and transfer student records
- **School & College modes** — Configurable institution settings
- **Netlify-ready** — Static deployment, no backend required

## Quick Start

```bash
# Install frontend dependencies
npm install

# Train/refresh the validated model (requires Python 3.10+)
pip install -r scripts/requirements.txt
npm run train

# Run locally
npm run dev

# Production build
npm run build
```

## Deploy to Netlify

1. Push to GitHub
2. Connect repo on [Netlify](https://app.netlify.com)
3. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy

> **Note:** Run `npm run train` before deploying to ensure `public/model/model.json` exists in the build.

## How Prediction Works

### 1. Training (offline, reproducible)

```
scripts/train_model.py
├── Loads UCI Student Performance Dataset (1,044 students)
├── Maps research features → application input fields
├── Trains Ridge Regression with StandardScaler
├── 5-fold cross-validation + 80/20 holdout test
└── Exports public/model/model.json with weights + metrics
```

### 2. Prediction (in browser)

```
Student Input → Z-score normalization → Ridge Regression → Predicted Grade (0-100%)
                                              ↓
                                    Risk Tier + Recommendations
                                    Prediction Interval (±RMSE)
```

### 3. Feature Importance (validated coefficients)

| Feature | Impact |
|---------|--------|
| Previous GPA | Strongest predictor (+15.3) |
| Exam Performance | High (+2.3) |
| Assignment Completion | Moderate (+1.0) |
| Attendance | Moderate |
| Study Hours | Moderate |

## CSV Import Format

```csv
name,rollNumber,grade,institutionType,attendance,previousGPA,studyHoursPerWeek,assignmentCompletion,examScoreAvg,participationScore,sleepHours,extracurricularHours,parentalSupport
John Smith,STU-001,Grade 10,school,92,3.4,12,88,75,80,7.5,4,78
```

## Retrain for Your Institution

For best accuracy at your school/college, replace `scripts/data/` with your historical student data (matching the feature columns) and re-run:

```bash
python scripts/train_model.py
npm run build
```

## Research Citation

> Cortez and Silva (2008). *Using Data Mining To Predict Secondary School Student Performance.*  
> UCI Machine Learning Repository. https://archive.ics.uci.edu/dataset/320/student+performance

## Important Notice for Institutions

- Predictions are **decision-support tools**, not replacements for teacher judgment
- Model was validated on **secondary school data from Portugal**
- Data is stored **locally in the browser** — export regularly
- For production multi-user deployment, consider adding a backend (Firebase/Supabase)

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion + Recharts
- scikit-learn (training pipeline)
- Netlify (deployment)

## License

MIT — Free for educational institutions worldwide.
