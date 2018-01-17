from pandas import Series
from matplotlib import pyplot
from statsmodels.tsa.arima_model import ARIMA
from statsmodels.tsa.arima_model import ARIMAResults
from sklearn.metrics import mean_squared_error
from math import sqrt
from differencing import difference
from differencing import inv_difference
import numpy
import pandas as pd
import time
from backend import API

data = API.fetch_history(2000).json()['Data']

history = [x['close'] for x in data[:int(len(data) * 0.7)]]
y = [x['close'] for x in data[int(len(data) * 0.7):]]

# load model
# model_fit = ARIMAResults.load('model.pkl')
predictions = list()

start = time.time()

# yhat = float(model_fit.forecast()[0])
# yhat = inv_difference(history, yhat, 1)
# predictions.append(yhat)
# history.append(y[0])
# print('>Predicted=%.3f, Expected=%3.f' % (yhat, y[0]))

for i in range(0, len(y)):
    diff = difference(history, 1)
    model = ARIMA(diff, order=(0, 0, 1))
    model_fit = model.fit(trend='nc', disp=0)
    yhat = model_fit.forecast()[0]
    yhat = inv_difference(history, yhat, 1)
    predictions.append(yhat)
    # observation
    obs = y[i]
    history.append(obs)
    # print('>Predicted=%.3f, Expected=%3.f' % (yhat, obs))

end = time.time()

mse = mean_squared_error(y, predictions)
rmse = sqrt(mse)
print('RMSE: %.3f' % rmse)
print(end - start)
pyplot.plot(y)
pyplot.plot(predictions, color='red')
pyplot.show()
