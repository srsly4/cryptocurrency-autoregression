def difference(dataset, interval=1):
    diff = list()
    for i in range(interval, len(dataset)):
        value = dataset[i] - dataset[i - interval]
        diff.append(value)
    return diff


def inv_difference(hist, y, interval=1):
    return y + hist[-interval]


# btc_series = pd.read_csv('dataset.csv', header=0)
# X = btc_series.values[:, 2]
# difference(X, 1).plot()
# pyplot.show()
