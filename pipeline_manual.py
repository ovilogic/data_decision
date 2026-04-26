from flask import Flask, jsonify, request
from price_features import SECTORS, build_features_df, compute_returns, compute_rolling_average, download_data
from model import run_kmeans

# try:
#     from flask_cors import CORS
#     print("flask_cors imported successfully.")
# except ImportError:
#     print("Failed to import flask_cors. Please ensure it is installed.")

# app = Flask(__name__)
# CORS(app)

# @app.route("/api/clustered-stocks", methods=["POST"])
def run_pipeline():
    # input_data = request.get_json()

    # print("=== Incoming request payload ===")
    # print(input_data)

    # sector_id = input_data.get("sector")
    # end_year = input_data.get("year")

    # print("Sector ID:", sector_id)
    # print("End Year:", end_year)

    sector_id = "1" # For testing purposes, we can hardcode the sector_id to "1" (Tech)
    if sector_id not in SECTORS:
        return jsonify({"error": "Invalid sector"}), 400
    
    selected_sector = SECTORS[sector_id]
    tickers = selected_sector["tickers"]

    data = download_data(tickers)
    returns_df = compute_returns(data)
    # print(returns_df.head())  # Debug: Print the first few rows of the returns DataFrame

    rolling_avg_df = compute_rolling_average(returns_df)
    features_df = build_features_df(data).dropna()
    print(features_df.head())  # Debug: Print the first few rows of the features DataFrame
    # This is where we have the features ready for clustering. We can now run KMeans on this DataFrame.

    clustered_df, model, scaler = run_kmeans(features_df)
    # Export to csv
    # clustered_df.to_csv("clustered_stocks.csv", index=True)
    # rolling_avg_df.to_csv("rolling_avg_stocks.csv", index=True)

    # print(clustered_df['cluster'])  # Debug: Print the count of stocks in each cluster
    # print(clustered_df.info())
    clustered_df = clustered_df.round(6) # Round the values to 6 decimal places for better readability
    company_map = SECTORS[sector_id]["companies"]
    clustered_df["company"] = clustered_df.index.map(company_map)

    print(clustered_df.head())  # Debug: Print the first few rows of the clustered DataFrame with company names
    avg_ret_clustered = clustered_df.groupby("cluster")["average_returns"].mean()
    vol_clustered = clustered_df.groupby("cluster")["volatility"].mean()
    max_dd_clustered = clustered_df.groupby("cluster")["max_drawdown"].mean()

    print("Average Returns by Cluster:")
    print(avg_ret_clustered)
    print("Volatility by Cluster:")
    print(vol_clustered)
    print("Max Drawdown by Cluster:")
    print(max_dd_clustered)

    # # Manual clustering and calculations on clusters:
    # clusters = {
    #     0: [],
    #     1: [],
    #     2: []
    # }
    # for i in clustered_df.index:
    #     if clustered_df.loc[i, "cluster"] == 0:
    #         clusters[0].append(i)
    #     elif clustered_df.loc[i, "cluster"] == 1:
    #         clusters[1].append(i)
    #     elif clustered_df.loc[i, "cluster"] == 2:
    #         clusters[2].append(i)

    # for k, v in clusters.items():
    #     print(f"Cluster {k}: {round(sum([clustered_df.loc[i, 'average_returns'] for i in v])/ len(v), 6)}")


    return clustered_df.to_dict(orient="index")
    # return jsonify({
    # "sector": selected_sector["name"],
    # # "year": end_year,
    # "clusters": clustered_df.to_dict(orient="index")
    # })

if __name__ == "__main__":
    run_pipeline()
    # app.run(debug=True)
   