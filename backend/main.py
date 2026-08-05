"""
Onboarding SLA Dashboard - Backend API
Reads the onboarding tracker CSV (uploaded by the user, not a hardcoded local
path) and computes everything the dashboard needs directly from the data
itself - no hardcoded day-count targets. "Normal" for each stage is defined
by the stage's own global average and spread, computed fresh each time.
"""
import io
import re
import time
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

APP_DIR = Path(__file__).parent
DATA_PATH = APP_DIR / "data" / "onboarding.csv"

app = FastAPI(title="Onboarding SLA Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tracks whatever the user has uploaded this run, so the frontend can show
# "currently loaded: <file>" instead of a hidden local path.
DATASET_INFO = {
    "filename": "onboarding.csv (bundled sample)",
    "uploadedAt": None,
}

# ---------------------------------------------------------------------------
# Config: each "stage" is an already-computed elapsed-day column from the
# source CSV. No fixed targets here - anomalies are judged against each
# stage's own global average + spread, recomputed from the live data.
# ---------------------------------------------------------------------------
STAGE_CONFIG = [
    {"column": "SLA Resource Fulfilment", "label": "Resource Fulfilment"},
    {"column": "SLA - BGV Completion", "label": "BGV Completion"},
    {"column": "SLA Finra Start Date", "label": "FINRA Initiation Gap"},
    {"column": "SLA - Finra Start to End", "label": "FINRA Start to Courier End"},
    {"column": "SLA - Onboarding Docs Submission", "label": "Onboarding Docs Submission"},
    {"column": "SLA - Magnit Documentation", "label": "Magnit Documentation"},
    {"column": "Onboarding Documents Submission - PID", "label": "Docs Submission to PID"},
    {"column": "SLA - MAC Set up", "label": "MAC Setup"},
]

GROUP_BY_COLUMN = "Project Details"
TOTAL_DURATION_COLUMN = "Complete Onboarding"
NAME_COLUMN = "Name"

FILTER_COLUMNS = ["Project Details", "Location", "Status", "CGI/External", "BGV Status"]

# A stage day-count can never be negative, and a gap over ~1 year almost
# certainly means the CSV cell had something other than a plain number in it
# (a stray date, a formula artifact, a typo). Anything outside this range is
# treated as bad data: excluded from averages and reported, not silently
# averaged in.
MIN_PLAUSIBLE_DAYS = 0
MAX_PLAUSIBLE_DAYS = 365

# How far above the global average counts as an anomaly, in standard
# deviations. 1.0 = flag anything meaningfully worse than typical.
ANOMALY_Z = 1.0


def normalize(name: str) -> str:
    """Collapse repeated whitespace so header quirks (double spaces, etc.)
    in the source CSV don't break column lookups."""
    return re.sub(r"\s+", " ", str(name).strip())


def clean_numeric_column(series: pd.Series) -> tuple[pd.Series, int]:
    """Coerce to numeric and drop implausible values (negative or absurdly
    large), which are near-certainly parsing artifacts rather than real
    elapsed-day counts. Returns the cleaned series and a count of rows
    dropped for that reason (separate from rows that were already blank)."""
    numeric = pd.to_numeric(series, errors="coerce")
    was_present = numeric.notna()
    implausible = was_present & ((numeric < MIN_PLAUSIBLE_DAYS) | (numeric > MAX_PLAUSIBLE_DAYS))
    dropped = int(implausible.sum())
    numeric = numeric.where(~implausible, other=pd.NA)
    return numeric, dropped


def load_dataframe(path: Path = DATA_PATH) -> tuple[pd.DataFrame, dict]:
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="No dataset loaded yet. Upload a CSV via the dashboard's upload button.",
        )

    df = pd.read_csv(path)
    df.columns = [normalize(c) for c in df.columns]

    data_quality = {}
    for stage in STAGE_CONFIG:
        col = stage["column"]
        if col in df.columns:
            cleaned, dropped = clean_numeric_column(df[col])
            df[col] = cleaned
            if dropped:
                data_quality[stage["label"]] = dropped

    if TOTAL_DURATION_COLUMN in df.columns:
        df[TOTAL_DURATION_COLUMN] = pd.to_numeric(df[TOTAL_DURATION_COLUMN], errors="coerce")

    for col in FILTER_COLUMNS:
        if col in df.columns:
            df[col] = df[col].fillna("Unspecified").astype(str).str.strip()
            df[col] = df[col].replace({"": "Unspecified", "nan": "Unspecified"})

    return df, data_quality


def get_active_filters(request: Request) -> dict:
    """Reads any of FILTER_COLUMNS present as query params, e.g.
    ?Project Details=Mobile Team&Status=Active. Empty/missing values are
    ignored so 'no filter' and 'filter cleared' behave the same."""
    filters = {}
    for col in FILTER_COLUMNS:
        val = request.query_params.get(col)
        if val:
            filters[col] = val
    return filters


def apply_filters(df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    for col, val in filters.items():
        if col in df.columns:
            df = df[df[col] == val]
    return df


def stage_stats(df: pd.DataFrame) -> dict:
    """Global average + std dev per stage, computed fresh from the cleaned
    data. This is the whole basis for what counts as an anomaly. When
    filters are active, `df` is already narrowed to the selected subset, so
    stats reflect that subset rather than the whole dataset."""
    stats = {}
    for stage in STAGE_CONFIG:
        col = stage["column"]
        if col not in df.columns:
            continue
        valid = df[col].dropna()
        if valid.empty:
            stats[stage["label"]] = {"average": None, "std": None, "anomalyCutoff": None}
            continue
        avg = float(valid.mean())
        std = float(valid.std()) if len(valid) > 1 else 0.0
        stats[stage["label"]] = {
            "average": round(avg, 1),
            "std": round(std, 1),
            "anomalyCutoff": round(avg + ANOMALY_Z * std, 1),
        }
    return stats


def build_candidate_records(df: pd.DataFrame, stats: dict) -> list[dict]:
    records = []
    for _, row in df.iterrows():
        record = {}
        for col in df.columns:
            val = row[col]
            if pd.isna(val):
                record[col] = None
            elif isinstance(val, float) and val.is_integer():
                record[col] = int(val)
            else:
                record[col] = val

        anomalies = {}
        stage_values = {}
        for stage in STAGE_CONFIG:
            col = stage["column"]
            val = row.get(col)
            label = stage["label"]
            cutoff = stats.get(label, {}).get("anomalyCutoff")
            if pd.isna(val):
                anomalies[label] = None
                stage_values[label] = None
            else:
                stage_values[label] = int(val) if float(val).is_integer() else float(val)
                anomalies[label] = bool(cutoff is not None and val > cutoff)
        record["_anomalies"] = anomalies
        record["_stageValues"] = stage_values
        records.append(record)
    return records


def build_anomaly_watchlist(df: pd.DataFrame, stats: dict) -> list[dict]:
    """Flat, ranked list of every candidate/stage anomaly - this is the
    'what exactly is wrong' view, worst deviation first."""
    watchlist = []
    name_col = NAME_COLUMN if NAME_COLUMN in df.columns else None
    group_col = GROUP_BY_COLUMN if GROUP_BY_COLUMN in df.columns else None

    for _, row in df.iterrows():
        for stage in STAGE_CONFIG:
            col = stage["column"]
            label = stage["label"]
            info = stats.get(label, {})
            avg = info.get("average")
            std = info.get("std")
            cutoff = info.get("anomalyCutoff")
            val = row.get(col)
            if col not in df.columns or pd.isna(val) or cutoff is None or val <= cutoff:
                continue
            deviation = float(val) - avg
            z_score = round(deviation / std, 1) if std else None
            watchlist.append({
                "candidate": str(row[name_col]) if name_col else "Unknown",
                "team": str(row[group_col]) if group_col else "Unspecified",
                "stage": label,
                "value": int(val) if float(val).is_integer() else float(val),
                "average": avg,
                "deviation": round(deviation, 1),
                "zScore": z_score,
            })

    watchlist.sort(key=lambda x: x["deviation"], reverse=True)
    return watchlist


@app.get("/api/candidates")
def get_candidates(request: Request):
    full_df, _ = load_dataframe()
    df = apply_filters(full_df, get_active_filters(request))
    stats = stage_stats(df)
    return {"columns": list(df.columns), "rows": build_candidate_records(df, stats)}


@app.get("/api/summary")
def get_summary(request: Request):
    """Global average per stage, team (Project Details) averages against
    that global average, anomaly counts, and a ranked anomaly watchlist -
    all derived from the (optionally filtered) data, no fixed targets.

    Filter dropdown option lists (`filters` in the response) are always
    built from the FULL, unfiltered dataset so previously-available options
    don't disappear as other filters get applied.
    """
    full_df, data_quality = load_dataframe()
    active_filters = get_active_filters(request)
    df = apply_filters(full_df, active_filters)
    stats = stage_stats(df)

    groups = df[GROUP_BY_COLUMN].unique().tolist() if GROUP_BY_COLUMN in df.columns else ["All"]

    by_group = []
    for group in groups:
        sub = df[df[GROUP_BY_COLUMN] == group] if GROUP_BY_COLUMN in df.columns else df
        entry = {"group": group, "candidateCount": int(len(sub))}
        for stage in STAGE_CONFIG:
            col = stage["column"]
            label = stage["label"]
            if col not in df.columns:
                continue
            avg = sub[col].mean()
            team_avg = None if pd.isna(avg) else round(float(avg), 1)
            entry[label] = team_avg
            global_avg = stats.get(label, {}).get("average")
            entry[f"{label}__vsAvg"] = (
                round(team_avg - global_avg, 1) if team_avg is not None and global_avg is not None else None
            )
        by_group.append(entry)

    stage_summary = []
    total_anomalies = 0
    for stage in STAGE_CONFIG:
        col = stage["column"]
        label = stage["label"]
        if col not in df.columns:
            continue
        valid = df[col].dropna()
        cutoff = stats.get(label, {}).get("anomalyCutoff")
        anomaly_count = int((valid > cutoff).sum()) if cutoff is not None else 0
        total_anomalies += anomaly_count
        stage_summary.append({
            "label": label,
            "column": col,
            "average": stats.get(label, {}).get("average"),
            "std": stats.get(label, {}).get("std"),
            "anomalyCutoff": cutoff,
            "anomalyCount": anomaly_count,
            "trackedCount": int(len(valid)),
            "excludedBadData": data_quality.get(label, 0),
        })

    kpis = {
        "totalCandidates": int(len(df)),
        "totalAnomalies": total_anomalies,
        "projectGroups": int(df[GROUP_BY_COLUMN].nunique()) if GROUP_BY_COLUMN in df.columns else 0,
        "avgTotalOnboardingDays": (
            round(float(df[TOTAL_DURATION_COLUMN].dropna().mean()), 1)
            if TOTAL_DURATION_COLUMN in df.columns and not df[TOTAL_DURATION_COLUMN].dropna().empty
            else None
        ),
        "dataQualityIssues": sum(data_quality.values()),
    }

    filters = {}
    for col in FILTER_COLUMNS:
        if col in full_df.columns:
            filters[col] = sorted(full_df[col].unique().tolist())

    return {
        "kpis": kpis,
        "stages": stage_summary,
        "byGroup": by_group,
        "groupColumn": GROUP_BY_COLUMN,
        "filters": filters,
        "activeFilters": active_filters,
        "dataQuality": data_quality,
        "anomalyWatchlist": build_anomaly_watchlist(df, stats),
        "dataset": DATASET_INFO,
    }


@app.get("/api/export")
def export_excel():
    df, _ = load_dataframe()
    stats = stage_stats(df)
    buffer = io.BytesIO()

    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Onboarding Data")
        worksheet = writer.sheets["Onboarding Data"]

        from openpyxl.styles import PatternFill

        anomaly_fill = PatternFill(start_color="FDECEA", end_color="FDECEA", fill_type="solid")
        header_map = {cell.value: cell.column for cell in worksheet[1]}

        for stage in STAGE_CONFIG:
            col_name = stage["column"]
            cutoff = stats.get(stage["label"], {}).get("anomalyCutoff")
            if col_name not in header_map or cutoff is None:
                continue
            col_idx = header_map[col_name]
            for row_idx in range(2, worksheet.max_row + 1):
                cell = worksheet.cell(row=row_idx, column=col_idx)
                if isinstance(cell.value, (int, float)) and cell.value > cutoff:
                    cell.fill = anomaly_fill

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Onboarding_SLA_Data.xlsx"},
    )


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Replace the working dataset with a user-uploaded CSV. This is the
    only way data gets into the app - no local file path required."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    contents = await file.read()
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_PATH, "wb") as f:
        f.write(contents)

    # Sanity check it actually parses before reporting success
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Couldn't parse that CSV: {exc}")

    DATASET_INFO["filename"] = file.filename
    DATASET_INFO["uploadedAt"] = time.time()

    return {"status": "ok", "filename": file.filename, "rowCount": int(len(df))}


@app.get("/api/dataset-info")
def dataset_info():
    return DATASET_INFO


@app.get("/api/health")
def health():
    return {"status": "ok"}