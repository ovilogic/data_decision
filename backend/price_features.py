import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

SECTORS = {
    "1": {
        "name": "Tech",
        "tickers": [
            "AAPL", "MSFT", "GOOGL", "AMZN", "META",
            "NVDA", "TSLA", "ORCL", "CRM", "ADBE",
            "INTC", "AMD", "AVGO", "QCOM", "TXN",
            "MU", "ASML", "NOW", "PANW", "SNOW"
        ],
        "companies": {
            "AAPL": "Apple Inc.",
            "MSFT": "Microsoft Corporation",
            "GOOGL": "Alphabet Inc.",
            "AMZN": "Amazon.com Inc.",
            "META": "Meta Platforms Inc.",
            "NVDA": "NVIDIA Corporation",
            "TSLA": "Tesla Inc.",
            "ORCL": "Oracle Corporation",
            "CRM": "Salesforce Inc.",
            "ADBE": "Adobe Inc.",
            "INTC": "Intel Corporation",
            "AMD": "Advanced Micro Devices",
            "AVGO": "Broadcom Inc.",
            "QCOM": "Qualcomm Inc.",
            "TXN": "Texas Instruments",
            "MU": "Micron Technology",
            "ASML": "ASML Holding",
            "NOW": "ServiceNow Inc.",
            "PANW": "Palo Alto Networks",
            "SNOW": "Snowflake Inc."
        }
    },

    "2": {
        "name": "Defence",
        "tickers": [
            "LMT", "RTX", "NOC", "GD", "LHX",
            "TXT", "HII", "BA", "RHM.DE", "HO.PA",
            "AIR.PA", "SAAB-B.ST", "MTX.DE", "SAF.PA", "EN.PA",
            "PLTR", "KTOS", "AVAV", "CACI"
        ],
        "companies": {
            "LMT": "Lockheed Martin Corporation",
            "RTX": "RTX Corporation",
            "NOC": "Northrop Grumman Corporation",
            "GD": "General Dynamics Corporation",
            "LHX": "L3Harris Technologies",
            "TXT": "Textron Inc.",
            "HII": "Huntington Ingalls Industries",
            "BA": "Boeing Company",
            "RHM.DE": "Rheinmetall AG",
            "HO.PA": "Thales Group",
            "AIR.PA": "Airbus SE",
            "SAAB-B.ST": "Saab AB",
            "MTX.DE": "MTU Aero Engines",
            "SAF.PA": "Safran SA",
            "EN.PA": "Bouygues SA",
            "PLTR": "Palantir Technologies",
            "KTOS": "Kratos Defense & Security Solutions",
            "AVAV": "AeroVironment Inc.",
            "CACI": "CACI International Inc."
        }
    },

    "3": {
        "name": "Energy",
        "tickers": [
            "XOM", "CVX", "SHEL", "BP", "TTE",
            "EQNR", "KMI", "WMB", "OKE", "ENB",
            "TRP", "MPLX", "SLB", "HAL", "BKR",
            "NEE", "ENPH", "FSLR", "ORSTED.CO"
        ],
        "companies": {
            "XOM": "Exxon Mobil Corporation",
            "CVX": "Chevron Corporation",
            "SHEL": "Shell plc",
            "BP": "BP plc",
            "TTE": "TotalEnergies SE",
            "EQNR": "Equinor ASA",
            "KMI": "Kinder Morgan Inc.",
            "WMB": "Williams Companies Inc.",
            "OKE": "ONEOK Inc.",
            "ENB": "Enbridge Inc.",
            "TRP": "TC Energy Corporation",
            "MPLX": "MPLX LP",
            "SLB": "Schlumberger Limited",
            "HAL": "Halliburton Company",
            "BKR": "Baker Hughes Company",
            "NEE": "NextEra Energy Inc.",
            "ENPH": "Enphase Energy Inc.",
            "FSLR": "First Solar Inc.",
            "ORSTED.CO": "Ørsted A/S"
        }
    }
}

# Clean data downloader function
def download_data(tickers, start="2020-09-16", end=None):
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
