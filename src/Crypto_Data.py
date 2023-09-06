import json
import requests
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.arima_process import ArmaProcess


class CryptoData:
    def __init__(self, cryptocurrency, exchange, days_limit, days_predict):
        self.cryptocurrency = cryptocurrency
        self.days_limit = days_limit
        self.days_predict = days_predict
        print(type(self.days_predict))
        self.exchange = exchange
        self.data_frame = None
        self.model = None
        self.model_with_external_factors = None
        self.predicted_values = None
        self.predicted_values_with_factors = None
        self.generate_model_with_external_factors()
        self.generate_model_without_external_factors()

    def get_historical_info(self):
        url = 'https://min-api.cryptocompare.com/data/histoday'
        params = {'fsym': self.cryptocurrency, 'tsym': 'USD', 'limit': self.days_limit, 'aggregate': 1,
                  'e': self.exchange}
        response = requests.get(url, params=params)
        self.data_frame = response.json()['Data']
        self.data_frame = pd.DataFrame(self.data_frame)

        self.data_frame['timestamp'] = pd.to_datetime(self.data_frame['time'], unit='s')
        self.data_frame.set_index('timestamp', inplace=True)
        self.data_frame.drop(['time'], axis=1, inplace=True)
        print(self.data_frame)

    def generate_model_with_external_factors(self):
        self.get_historical_info()
        data = self.data_frame['high']
        exog = self.generate_external_factors(len(data))
        print(exog)
        model = ARIMA(data, exog=exog, order=(2, 1, 2))
        model = model.fit()
        future_exog = self.generate_external_factors(self.days_predict)
        self.predict_model(model, future_exog)

    def generate_model_without_external_factors(self):
        self.get_historical_info()
        data = self.data_frame['high']
        model = ARIMA(data, order=(2, 1, 2))
        model = model.fit()

        self.predict_model(model)

    def generate_external_factors(self, n):
        # Задайте параметри ARMA процесу
        ar_params = np.array([0.5])  # Коефіцієнти AR
        ma_params = np.array([0.1])  # Коефіцієнти MA
        arma_process = ArmaProcess(ar_params, ma_params)

        # Згенеруйте ARMA процес для зовнішніх факторів
        external_factors = arma_process.generate_sample(nsample=n)

        return external_factors

    def predict_model(self, model, future_exog=None):
        if future_exog is None:
            self.predicted_values = model.forecast(steps=self.days_predict).to_json()
        else:
            self.predicted_values_with_factors = model.forecast(steps=self.days_predict, exog=future_exog).to_json()

    def get_predicted_data(self):
        return self.prepare_data()

    def prepare_data(self):
        self.predicted_values = json.loads(self.predicted_values)
        return_values = []
        for i in self.predicted_values.items():
            return_values.append({"date": i[0], "price": i[1]})
        return_values_with_factors = []
        self.predicted_values_with_factors = json.loads(self.predicted_values_with_factors)
        for i in self.predicted_values_with_factors .items():
            return_values_with_factors.append({"date": i[0], "price": i[1]})
        ret_all = {"values": return_values, "values_with_factors": return_values_with_factors}
        return ret_all
