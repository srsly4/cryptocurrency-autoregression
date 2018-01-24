import json
from json import JSONEncoder
from threading import Event

import time
import logging
from websocket_server import WebsocketServer
from backend.API import fetch_history, get_current
from backend.cron_updating import Timer
from random import Random

from backend.arima import ArimaRegressor

PORT = 9001
IP = '127.0.0.1'


def random_generator(start, end, period):
    rand = Random()
    if start == end:
        return {'x': [], 'y': []}
    if start > end:
        start, end = end, start
    x = list(range(start, end, period))
    return {'x': x, 'y': [11500 + 1000 * (rand.random() - 0.5) for _ in x]}


def get_model(server, currency, output_currency):
    try:
        model = server.models.get(currency)
        if model:
            model = model.get(output_currency)
        else:
            server.models[currency] = {}
    except AttributeError:
        model = None
        server.models = {currency: {}}

    if not model:
        data = fetch_history(2000, currency=currency, output_currency=output_currency).json().get('Data')
        model = server.models[currency][output_currency] = \
            ArimaRegressor([x['time'] for x in data], [x['close'] for x in data])

    return model


def new_client(client, server):
    print('New client connected')
    print(client)


def data_request(client, server, message):
    currency, output_currency = \
        client['currency'], client['output_currency'] = \
        message.get('currency'), message.get('outputCurrency')
    res = fetch_history(message.get('records'), currency=currency,
                        output_currency=output_currency)

    if res:
        data = res.json().get('Data', [])
        msg = {
            'type': 'INITIAL_STATE',
            'data': data,
        }

        model = get_model(server, currency, output_currency)
        model.feed_data([x['time'] for x in data], [x['close'] for x in data])

        server.send_message(client, JSONEncoder().encode(msg))
    else:
        print('Error while fetching data')
        server.send_message(client, JSONEncoder().encode({'type': 'ERROR', 'msg': 'Couldn\'t fetch data'}))


def forecast_request(client, server, message):
    try:
        currency = client.currency
        output_currency = client.output_currency
    except AttributeError:
        currency, output_currency = 'BTC', 'USD'
    start = message.get('startTimestamp', 0)
    end = message.get('endTimestamp', 0)
    model = get_model(server, currency, output_currency)
    x = list(range(start, end + 1, 60))
    data = {'x': x, 'y': model.predict(x)}
    msg = {
        'type': 'FORECAST',
        'data': data
    }
    server.send_message(client, JSONEncoder().encode(msg))


def default_handler(client, server, message):
    msg = {
        'type': 'ERROR',
        'msg': 'Request type {} is not supported'.format(message.get('type'))
    }
    server.send_message(client, JSONEncoder().encode(msg))


handlers = {
        'REQUEST_CURRENCY': data_request,
        'REQUEST_FORECAST': forecast_request,
    }


def new_message(client, server, message):
    message = json.loads(message)
    handlers.get(message.get('type'), default_handler)(client, server, message)


def update(server):
    clients = server.clients.copy()
    while clients:
        currency = clients[0].get('currency')
        output_currency = clients[0].get('output_currency')
        res = get_current(currency, output_currency)
        data = {} if not res else res.json()
        # try:
        #     model = server.models.get(currency, {}).get(output_currency)
        # except AttributeError:
        #     model = None
        msg = {
            'type': 'UPDATE',
            'timestamp': int(time.time()),
            'data': data,
        }
        # if model:
        #     model.feed_data([msg['timestamp']], [data.get(output_currency)])
        for client in clients:
            if (client.get('currency'), client.get('output_currency')) == (currency, output_currency):
                server.send_message(client, JSONEncoder().encode(msg))
                clients.remove(client)


def update_models(server):
    for currency in server.models:
        for output_currency in server.models.get(currency):
            model = get_model(server, currency, output_currency)
            print("Updating model {}-{}".format(currency, output_currency))
            res = get_current(currency, output_currency)
            data = {} if not res else res.json()
            msg = {
                'type': 'UPDATE',
                'timestamp': int(time.time()),
                'data': data,
            }
            model.feed_data([msg['timestamp']], [data.get(output_currency)])


def print_clients(server):
    print(server.clients)


def start_server(loglevel=logging.WARNING):
    stop_event = Event()
    stop_event.set()
    server = WebsocketServer(PORT, IP, loglevel)
    timer = Timer(5, update, stop_event, server)
    timer.start()
    timer2 = Timer(60, update_models, stop_event, server)
    timer2.start()
    server.set_fn_new_client(new_client)
    server.set_fn_message_received(new_message)
    server.run_forever()
    stop_event.clear()
    print('Gracefully stopping')

