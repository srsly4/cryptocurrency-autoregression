import numpy as np
import time
from numpy import newaxis
from keras.layers.core import Dense, Activation, Dropout
from keras.layers.recurrent import LSTM
from keras.models import Sequential

epochs = 10
seq_len = 50


def prepare_data(x, y, seq_len, window_normalisation):
    pass


def build_model(layers):
    model = Sequential()
    model.add(LSTM(
        input_dim=layers[0],
        output_dim=layers[1],
        return_sequences=True))
    model.add(Dropout(0.2))

    model.add(LSTM(
        layers[2],
        return_sequences=False))
    model.add(Dropout(0.2))

    model.add(Dense(
        output_dim=layers[3]))
    model.add(Activation("linear"))

    start = time.time()
    model.compile(loss="mse", optimizer="rmsprop")
    print("> Compilation Time : ", time.time() - start)
    return model


class Model:
    def __init__(self, init_x=list(), init_y=list(), epochs=5):
        self.model = build_model([1, 50, 100, 1])
        self.model.fit(
            np.array(init_x),
            np.array(init_y),
            batch_size=50,
            nb_epoch=epochs,
            validation_split=0.05)

    def predict(self, x):
        return {'x': x, 'y': self.model.predict(np.array(x), batch_size=50).tolist()}

    def feed_data(self, x=list(), y=list()):
        self.model.train_on_batch(np.array(x), np.array(y))

