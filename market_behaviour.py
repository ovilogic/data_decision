import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


# apple = yfinance.Ticker('AAPL')

TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "TSLA", "NVDA", "JPM", "V", "UNH",
    "HD", "PG", "DIS", "BAC", "XOM",
    "KO", "PEP", "INTC", "CSCO", "ORCL"
]
data = yf.download(tickers=TICKERS[0: 2], start="2023-01-01", end="2024-01-01", auto_adjust=False)
print(data.columns)
print(data["Close"])
