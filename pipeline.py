from flask import Flask, jsonify, request
from price_features import SECTORS, build_features_df, compute_returns, compute_rolling_average, download_data
from model import run_kmeans


app = Flask(__name__)

# @app.route("/api/clustered-stocks", methods=["POST"])
def run_pipeline():
    # sector_id = request.json.get("sector")
    sector_id = "1" # For testing purposes, we can hardcode the sector_id to "1" (Tech)
    if sector_id not in SECTORS:
        return jsonify({"error": "Invalid sector"}), 400
    
    selected_sector = SECTORS[sector_id]
    tickers = selected_sector["tickers"]

    data = download_data(tickers)
    returns_df = compute_returns(data)
    rolling_avg_df = compute_rolling_average(returns_df)
    features_df = build_features_df(data)
    clustered_df, model, scaler = run_kmeans(features_df)
    # Export to csv
    clustered_df.to_csv("clustered_stocks.csv", index=True)
    rolling_avg_df.to_csv("rolling_avg_stocks.csv", index=True)
    return clustered_df

if __name__ == "__main__":
    clustered_stocks = run_pipeline()
    print(clustered_stocks)
    