from lstm_utils import load_data
from lstm_utils import build_model
from lstm_utils import predict_point_by_point
from lstm_utils import predict_sequence_full
from lstm_utils import predict_sequences_multiple
from plot_utils import plot_results
from plot_utils import plot_results_multiple
from sklearn.metrics import mean_squared_error
from math import sqrt

epochs = 1
seq_len = 50

print('> Loading data... ')

X_train, y_train, X_test, y_test = load_data('/home/kamilianek/python/autoregression/btc.csv', seq_len, True)

print('> Data Loaded. Compiling...')

model = build_model([1, 50, 100, 1])

model.fit(
    X_train,
    y_train,
    batch_size=512,
    nb_epoch=epochs,
    validation_split=0.05)

predicted = predict_sequences_multiple(model, X_test, seq_len, 5)

plot_results_multiple(predicted, y_test, 5)