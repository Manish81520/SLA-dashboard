# Onboarding SLA Dashboard

A two-part app:
- **backend/** — Python FastAPI service that reads the onboarding tracker CSV and serves processed JSON (averages, breach flags, filters, Excel export).
- **frontend/** — React + Vite + Tailwind dashboard (KPIs, pipeline stepper, charts, filterable candidate table).

## 1. Add your real data

Replace the sample file at:
```
backend/data/onboarding.csv
```
with your actual export, keeping the same column headers (PSA ID, Name, Email Id, Status, ... BGV Status). The included sample file shows the exact expected format.

You can also upload a new CSV at runtime via `POST /api/upload` (multipart form field `file`) once the backend is running — useful if you don't want to touch the file on disk each time.

## 2. Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at http://localhost:8000. Check http://localhost:8000/api/summary in a browser to confirm it's serving data.

## 3. Run the frontend

In a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173 and proxies `/api/*` calls to the backend automatically (see `vite.config.js`).

Open http://localhost:5173 in your browser.

## How anomalies are determined (no hardcoded thresholds)

There are no fixed day-count targets anywhere in this app. For each stage, the backend computes the **global average and standard deviation across all candidates**, fresh from whatever is in the CSV each time. A candidate is flagged as an anomaly for a stage if their elapsed days are **more than 1 standard deviation above that stage's own average**.

This means:
- Thresholds move automatically as your data changes — no manual tuning.
- Team performance is shown **against the live global average**, not an arbitrary number (see the per-stage charts: each has a dashed reference line at the global average, and bars go red when a team is above it).
- If you want a stricter or looser definition of "anomaly," change `ANOMALY_Z` near the top of `backend/main.py` (e.g. `1.5` = flag fewer, more extreme cases; `0.5` = flag more).

## Data quality safeguards

Elapsed-day values that are negative or implausibly large (over 365 days, configurable via `MIN_PLAUSIBLE_DAYS` / `MAX_PLAUSIBLE_DAYS` in `backend/main.py`) are treated as parsing artifacts, not real data — they're excluded from averages and reported in the dashboard as a "Rows Excluded (Bad Data)" KPI and a warning banner, rather than silently skewing the numbers. If you see this banner, it means some cells in your CSV had something other than a plain day-count in them (a stray date, formula artifact, stray character, etc.) — worth checking those specific columns in the raw file.

## Building for production

```bash
cd frontend
npm run build
```
This outputs static files to `frontend/dist/`. Serve them with any static host, or point FastAPI at that folder to serve both from one process (ask if you want this wired up).

## What's included

- KPI summary cards (candidates tracked, total breaches, project groups, avg total onboarding days)
- Pipeline stepper showing avg. days and breach counts per stage, in process order
- Grouped bar chart: avg days per stage, split by **Project Details**
- Filterable, searchable candidate table with color-coded breach cells
- One-click Excel export (breached cells highlighted) via `/api/export`
