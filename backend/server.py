import json
from json import JSONEncoder
from threading import Event

import time
import logging
from websocket_server import WebsocketServer
from backend.API import fetch_history, get_current
from backend.cron_updating import Timer
from random import Random

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
        server.send_message(client, JSONEncoder().encode(msg))
    else:
        print('Error while fetching data')
        server.send_message(client, JSONEncoder().encode({'type': 'ERROR', 'msg': 'Couldn\'t fetch data'}))


def forecast_request(client, server, message):
    start = message.get('startTimestamp', 0)
    end = message.get('endTimestamp', 0)
    data = random_generator(start, end, 5)
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


def new_message(client, server, message):
    message = json.loads(message)
    handler = {
        'REQUEST_CURRENCY': data_request,
        'REQUEST_FORECAST': forecast_request,
    }.get(message.get('type'), default_handler)(client, server, message)


def update(server):
    clients = server.clients.copy()
    while clients:
        currency = clients[0].get('currency')
        output_currency = clients[0].get('output_currency')
        res = get_current(currency, output_currency)
        data = {} if not res else res.json()
        msg = {
            'type': 'UPDATE',
            'timestamp': int(time.time()),
            'data': data,
        }
        for client in clients:
            if (client.get('currency'), client.get('output_currency')) == (currency, output_currency):
                server.send_message(client, JSONEncoder().encode(msg))
                clients.remove(client)


def print_clients(server):
    print(server.clients)


def start_server(loglevel=logging.WARNING):
    stop_event = Event()
    stop_event.set()
    server = WebsocketServer(PORT, IP, loglevel)
    timer = Timer(5, update, stop_event, server)
    timer.start()
    server.set_fn_new_client(new_client)
    server.set_fn_message_received(new_message)
    server.run_forever()
    stop_event.clear()
    print('Gracefully stopping')

