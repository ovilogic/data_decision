from price_features import TICKERS, build_features_df, compute_returns, compute_rolling_average, download_data
from model import run_kmeans

def run_pipeline(tickers=TICKERS):
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