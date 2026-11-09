# AI-Based Intrusion Detection System (AI-IDS) — Frontend

A cybersecurity Security Operations Center (SOC) dashboard frontend built for an academic MCA Major Project. Designed to integrate directly with a Python FastAPI and Scikit-learn backend running Random Forest, Decision Tree, and Support Vector Machine (SVM) models.

---

## ⚡ Server Port & Real-Time API Configuration

- **Frontend Development Server:** Runs on **`http://localhost:3000`** (configured in [`vite.config.ts`](file:///c:/Users/punee/Desktop/AI%20intrution%20%20project/vite.config.ts)).
- **Python Backend Target:** Configured in [`.env`](file:///c:/Users/punee/Desktop/AI%20intrution%20%20project/.env) via `VITE_API_BASE_URL=http://localhost:8000/api`.
- **Zero Mock Data:** All hardcoded mock datasets have been removed. Every module directly connects to the Python FastAPI REST API.

---

## 🚀 Modules Overview

### 1. Dashboard (`/`)
- Ingests telemetry directly from `GET /api/stats`.
- Visualizes network flow timelines from `GET /api/traffic-chart`.
- Categorizes protocol compositions from `GET /api/protocols`.
- Displays recent active alerts from `GET /api/alerts`.

### 2. Network Traffic Detection
- Ingests user-uploaded network flow CSV files.
- Selects the target classifier (`random_forest`, `decision_tree`, or `svm`).
- Streams the payload to `POST /api/predict` via `FormData`.
- Renders returned predictions with confidence scores, protocol metadata, and threat categories.

### 3. Dataset Management
- Queries registered dataset files from `GET /api/datasets`.
- Handles new file registrations via `POST /api/datasets/upload`.
- Includes an interactive 41-feature schema inspector for NSL-KDD and NetFlow features.

### 4. Model Performance & Benchmarks
- Directly visualizes quantitative evaluation metrics (Accuracy, Precision, Recall, F1-Score, Latency, Training Time) from `GET /api/models/metrics`.
- Renders responsive bar chart comparisons for Random Forest, Decision Tree, and SVM.

### 5. Security Alerts & Incident Response
- Ingests security alerts from `GET /api/alerts`.
- Supports updating alert statuses (`mitigated`, `investigating`, `active`) via `PATCH /api/alerts/:id`.
- Multi-factor filtering by severity (`Critical`, `High`, `Medium`, `Low`) and search.

### 6. Settings & System Configuration
- Intrusion alert confidence threshold slider (50% – 99%).
- Configurable default ML algorithm.
- Live backend connectivity test (`GET /api/health`).

---

## 🏃 Running the Application

```powershell
# 1. Start the Vite server on port 3000
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

To verify a production build:
```powershell
npm run build
npm run preview
```
