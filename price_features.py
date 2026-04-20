import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import math


# apple = yfinance.Ticker('AAPL')

TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "TSLA", "NVDA", "JPM", "V", "UNH",
    "HD", "PG", "DIS", "BAC", "XOM",
    "KO", "PEP", "INTC", "CSCO", "ORCL"
]
# data = yf.download(tickers=TICKERS, start="2023-01-01", end=None, auto_adjust=False)
# data.to_pickle("data.pkl")
data = pd.read_pickle("data.pkl")
# print(data.head())

data = data["Adj Close"].dropna()
# print(data.columns)
# print(data.iloc[0, 2])

# Let's reduce the size of the data to make it easier to understand the operations on it.
data = data.iloc[0:5, 0:2]
# print(data)


# First feature: returns.
returns = data.pct_change().dropna()
# print(returns)

# Average returns
avg_returns = returns.mean()
# print(avg_returns)
man_avg = []
for i in returns.columns:
    # manual = round(returns[i].mean(), 6)
    # print(i, returns[i], len(returns[i]))
    # print(sum(returns[i]))
    manual = round(sum(returns[i])/len(returns[i]), 6)
    man_avg.append(manual)
# print("Man returns averaged: ", man_avg)

# Volatility
# print(type(returns))
# print(returns.shape)
# print(returns.iloc[:, 0], returns.iloc[:, 1])
print("-"*10, "RETURNS", returns, "-"*10, sep='\n')
# print(returns.iloc[:, 0])

# print("*"*10, "Standard Deviation:", returns.std(), "*"*10, sep='\n')
# print(type(returns.std()))

## Manual std deviation of returns. Which is the same as volatility.
avg_ret_apple = avg_returns.iloc[0]
avg_ret_amz = avg_returns.iloc[1]
averages = [avg_ret_apple, avg_ret_amz]
deviations = []
my_std = []

avg_count = 0
for i in returns.columns:
    # print(returns[i])
    avg = averages[avg_count]
    avg_count += 1
    for j in returns[i]:
        r_i = round(j, 6)
        man_std = (r_i - avg)**2
        deviations.append(man_std)
    std_man = math.sqrt(sum(deviations)/(len(deviations) - 1))
    my_std.append(round(std_man, 6))
    deviations = []
    # print(f"Manual std deviation for {i}: ", round(std_man, 6))

# print("My std deviations: ", my_std, "\n", "Pandas std deviations: ", returns.std().values)

## Pandas volatility function
volatility = returns.std()

# Rolling average of returns
roll = returns.rolling(window=2).mean()
# print(roll)
## Manual rolling average of returns
rolling_avg = []
roll_1 = returns.iloc[0, 0]
roll_2 = returns.iloc[1, 0]
rolling_avg.append((roll_1 + roll_2) / 2)
# print("Rolling average: ", rolling_avg)
roll_3 = returns.iloc[2, 0]
# print("Rolling average: ", round((roll_2 + roll_3) / 2, 6))

def max_drawdown(price_df):
    roll_max = price_df.cummax()
    drawdown = (price_df - roll_max) / roll_max
    return drawdown.min()

roll_max = returns.cummax()
dd = (returns - roll_max)/roll_max
print("All drawdowns:", dd)
# Because you subtract the roll_max from returns, you get negative values. The minimum of those negative values is the maximum drawdown.
dd = dd.min()
print("Maximum drawdown:", dd)
print("Maximum drawdown using function:", max_drawdown(returns))