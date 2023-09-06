import pandas as pd
import requests
from Crypto_Data import CryptoData

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import requests

# Запит до API Cryptocompare
url = 'https://min-api.cryptocompare.com/data/histoday'
params = {
    'fsym': 'BTC',  # Символ криптовалюти (Bitcoin)
    'tsym': 'USD',  # Валюта (USD)
    'limit': 365    # Кількість днів історичних даних (максимум 365)
}
response = requests.get(url, params=params)
data = response.json()['Data']

# Побудова датафрейму з даними
df = pd.DataFrame(data)
df['Date'] = pd.to_datetime(df['time'], unit='s')
df.set_index('Date', inplace=True)
# Тренування моделі ARIMA
model = ARIMA(df['close'], order=(1, 0, 0))
model_fit = model.fit()

# Прогнозування на всьому наборі даних
forecast = model_fit.predict(start=1, end=len(df))

# Візуалізація результатів прогнозу
plt.plot(df.index, df['close'], label='Actual')
plt.plot(df.index, forecast, label='Forecast')
plt.xlabel('Date')
plt.ylabel('Price (USD)')
plt.title('Bitcoin Price Forecast')
plt.legend()
plt.show()