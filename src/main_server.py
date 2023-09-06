import time

from flask import Flask, render_template, request, jsonify
from Crypto_Data import CryptoData

app = Flask(__name__)


@app.route('/')
def hello():
    return render_template("mainPage.html")


@app.route("/get_data", methods=["POST"])
def get_data():
    data = request.get_json()
    print(data)
    print(data.get("Currency"))
    print(data.get("days_limit"))
    print(data.get("days_predict"))
    cryptocurrency = data.get("Currency")
    exchange = "Kraken"
    time.sleep(3)
    days_limit = data.get("days_limit")
    days_predict = data.get("days_predict")
    return_data = CryptoData(cryptocurrency, exchange, int(days_limit), int(days_predict)).get_predicted_data()
    return jsonify(return_data)


app.run()
