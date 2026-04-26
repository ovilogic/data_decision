from flask import Flask, jsonify, request
from price_features import SECTORS, build_features_df, compute_returns, compute_rolling_average, download_data
from model import run_kmeans

try:
    from flask_cors import CORS
    print("flask_cors imported successfully.")
except ImportError:
    print("Failed to import flask_cors. Please ensure it is installed.")

app = Flask(__name__)
CORS(app)

@app.route("/api/clustered-stocks", methods=["POST"])
def run_pipeline():
    input_data = request.get_json()
    sector_id = input_data.get("sector")
    end_year = input_data.get("year")

    if sector_id not in SECTORS:
        return jsonify({"error": "Invalid sector"}), 400
    
    selected_sector = SECTORS[sector_id]
    tickers = selected_sector["tickers"]

    data = download_data(tickers)
    returns_df = compute_returns(data)

    rolling_avg_df = compute_rolling_average(returns_df)
    features_df = build_features_df(data).dropna()

    clustered_df, model, scaler = run_kmeans(features_df)
    # Export to csv
    # clustered_df.to_csv("clustered_stocks.csv", index=True)
    # rolling_avg_df.to_csv("rolling_avg_stocks.csv", index=True)

    clustered_df = clustered_df.round(6) # Round the values to 6 decimal places for better readability
    company_map = SECTORS[sector_id]["companies"]
    clustered_df["company"] = clustered_df.index.map(company_map)

    avg_ret_clustered = clustered_df.groupby("cluster")["average_returns"].mean()
    vol_clustered = clustered_df.groupby("cluster")["volatility"].mean()
    max_dd_clustered = clustered_df.groupby("cluster")["max_drawdown"].mean()
   
    return jsonify({
    "sector": selected_sector["name"],
    "year": end_year,
    "clusters": clustered_df.to_dict(orient="index"),
    "cluster_averages": {
        "avg_returns": avg_ret_clustered.to_dict(),
        "avg_volatility": vol_clustered.to_dict(),
        "avg_max_drawdown": max_dd_clustered.to_dict()
    }
    })

if __name__ == "__main__":
    app.run(debug=True)
   