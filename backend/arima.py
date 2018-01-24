import random
import time
from statsmodels.tsa.arima_model import ARIMA
from backend.differencing import difference
from backend.differencing import inv_difference


class ArimaRegressor:
    def __init__(self, x: list, y: list, m=None):
        self._history_x = x
        self._history_y = y
        self._model = m
        self._prediction_time = None

    def feed_data(self, list_x, list_y):
        self._history_x.extend(list_x)
        self._history_y.extend(list_y)

    def predict(self, test_x) -> list:

        predictions = list()
        history = self._history_y
        diff = difference(history, 1)

        start = time.time()

        # in the first step use previous model if exists
        if self._model is not None:
            model = self._model
        else:
            model = ARIMA(diff, order=(0, 0, 1))

        # fit model
        model_fit = model.fit(trend='nc', disp=0)

        # compute predicted value
        yhat = (-2 * random.random() + 1) * abs(model_fit.forecast()[0] + model_fit.forecast()[1])
        yhat = inv_difference(history, yhat, 1)[0]
        predictions.append(yhat)

        # use predicted value in next prediction
        history.append(yhat)

        # next values to predict
        for i in range(1, len(test_x)):
            diff = difference(history, 1)
            model = ARIMA(diff, order=(0, 0, 1))
            model_fit = model.fit(trend='nc', disp=0)
            yhat = (-2 * random.random() + 1) * abs(model_fit.forecast()[0] + model_fit.forecast()[1])
            yhat = inv_difference(history, yhat, 1)[0]
            predictions.append(yhat)
            history.append(yhat)

        end = time.time()
        self._prediction_time = end - start
        self._model = model
        return predictions

    @property
    def model(self) -> ARIMA:
        if self._model is None:
            raise Exception('You need to call `fit` model first')
        return self._model

    @property
    def prediction_time(self):
        if self._prediction_time is None:
            raise Exception('You need to make prediction first')
        return self._prediction_time


# dataset = pd.read_csv('/home/kamilianek/python/cryptocurrency-autoregression/data.csv', header=0, sep=';')
# y_set = dataset["USD"].values.tolist()
# x_set = dataset["timestamp"].values.tolist()
#
# history_x = [x for x in x_set[:int(len(x_set) * 0.7)]]
# x_predict = [x for x in x_set[int(len(x_set) * 0.7):]]
#
# history_y = [x for x in y_set[:int(len(x_set) * 0.7)]]
# y_to_predict = [x for x in y_set[int(len(x_set) * 0.7):]]
#
# print(y_to_predict)
#
# regressor = ArimaRegressor(history_x, history_y)
# regressor.feed_data([1516272360, 1516272420], [15000, 14500])
# prediction_values = regressor.predict(x_predict)
#
# pyplot.plot(y_to_predict)
# pyplot.plot(prediction_values, color='red')
# pyplot.show()
#
#
# print(regressor.model)
# print(regressor.prediction_time)
# print(len(prediction_values) == len(x_predict))













