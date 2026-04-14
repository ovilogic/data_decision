import yfinance
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


apple = yfinance.Ticker('AAPL')

print(apple.info.get("longName"))
print(apple.info.get("sector"))
print(apple.info.get("industry"))
print(apple.info.get("marketCap"))