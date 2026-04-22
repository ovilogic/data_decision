import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import math


# apple = yfinance.Ticker('AAPL')
SECTORS = {
    "1": {
        "name": "Tech",
        "tickers": [
            "AAPL", "MSFT", "GOOGL", "AMZN", "META",
            "TSLA", "NVDA", "JPM", "V", "UNH",
            "HD", "PG", "DIS", "BAC", "XOM",
            "KO", "PEP", "INTC", "CSCO", "ORCL"
            ]
            },
    "2": {
        "name": "Defence",
        "tickers": ["LMT", "RTX", "NOC", "BA"]
    },
    "3": {
        "name": "Energy",
        "tickers": ["XOM", "CVX", "BP", "SHEL"]
    }
}

TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "TSLA", "NVDA", "JPM", "V", "UNH",
    "HD", "PG", "DIS", "BAC", "XOM",
    "KO", "PEP", "INTC", "CSCO", "ORCL"
]

# Clean data downloader function
def download_data(tickers, start="2023-01-01", end=None):
    data = yf.download(tickers=tickers, start=start, end=end, auto_adjust=False)
    data = data["Adj Close"].dropna()
    if isinstance(data, pd.Series):
        data = data.to_frame()
    return data

# First feature: returns.
def compute_returns(ticker_prices):
    returns = ticker_prices.pct_change().dropna()
    return returns

# Average returns
def compute_average_returns(returns):
    avg_returns = returns.mean() * 252 # Annualize the average returns by multiplying by 252 (number of trading days in a year)
    return avg_returns

def compute_volatility(returns):
    volatility = returns.std() * np.sqrt(252) # Annualize the volatility by multiplying by the square root of 252
    return volatility

def compute_rolling_average(returns, window=20):
    rolling_avg = returns.rolling(window=window).mean()
    return rolling_avg

def compute_max_drawdown(price_df):
    roll_max = price_df.cummax()
    drawdown = (price_df - roll_max) / roll_max
    return drawdown.min()

def build_features_df(price_df):
    returns = compute_returns(price_df)
    avg_returns = compute_average_returns(returns)
    volatility = compute_volatility(returns)
    max_drawdown = compute_max_drawdown(price_df)
    
    features = pd.DataFrame({
        "average_returns": avg_returns,
        "volatility": volatility,
        "max_drawdown": max_drawdown
    })
    
    return features
