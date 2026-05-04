from flask import Flask, jsonify, request
from datetime import datetime, date
import pandas as pd
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from price_features import (
    SECTORS,
    compute_returns,
    build_features_df,
    compute_rolling_average,
    download_data
)
from model import run_kmeans
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["60 per minute"]
)

# -----------------------------
# CONFIG (single source of truth)
# -----------------------------
DEFAULT_START_DATE = "2020-09-16"


def sanitize_end_date(end_date: str | None):
    today = date.today()

    if not end_date:
        return None

    try:
        parsed = pd.to_datetime(end_date).date()
    except Exception:
        return None

    if parsed >= today:
        return None
    print("Sanitized end date:", parsed)
    return parsed


@app.route("/api/clustered-stocks", methods=["POST"])
@limiter.limit("10 per minute")
def run_pipeline():
    input_data = request.get_json()

    sector_id = input_data.get("sector")
    end_date = input_data.get("end_date")

    if sector_id not in SECTORS:
        return jsonify({"error": "Invalid sector"}), 400

    selected_sector = SECTORS[sector_id]
    tickers = selected_sector["tickers"]

    # fixed + sanitized date logic
    start_date = DEFAULT_START_DATE
    end_date = sanitize_end_date(end_date)

    data = download_data(
        sector_id=sector_id,
        tickers=tickers,
        start=start_date,
        end=end_date if end_date is None else str(end_date)
    )

    if data.empty:
        return jsonify({"error": "No data available for selected date range"}), 400

    features_df = build_features_df(data).dropna()
    clustered_df, model, scaler = run_kmeans(features_df)

    clustered_df = clustered_df.round(6)

    company_map = selected_sector["companies"]
    clustered_df["company"] = clustered_df.index.map(company_map)

    # cluster stats
    avg_ret_clustered = clustered_df.groupby("cluster")["average_returns"].mean()
    vol_clustered = clustered_df.groupby("cluster")["volatility"].mean()
    max_dd_clustered = clustered_df.groupby("cluster")["max_drawdown"].mean()

    # rolling averages
    returns = compute_returns(data)
    rolling_avg = compute_rolling_average(returns).dropna()

    cluster_labels = clustered_df["cluster"]
    rolling_avg_clustered = rolling_avg.T.groupby(cluster_labels).mean()

    rolling_avg_clustered = rolling_avg_clustered.round(6)
    rolling_avg_clustered.columns = rolling_avg_clustered.columns.astype(str)
    rolling_avg_clustered = rolling_avg_clustered.T

    return jsonify({
        "sector": selected_sector["name"],
        "start_date": start_date,
        "end_date": str(end_date),

        "clusters": clustered_df.to_dict(orient="index"),

        "cluster_averages": {
            "avg_returns": avg_ret_clustered.to_dict(),
            "avg_volatility": vol_clustered.to_dict(),
            "avg_max_drawdown": max_dd_clustered.to_dict()
        },

        "rolling_avg_clustered": rolling_avg_clustered.to_dict()
    })


if __name__ == "__main__":
    app.run(debug=True)
   

