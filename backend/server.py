from json import JSONEncoder
from threading import Event

import time
import logging
from websocket_server import WebsocketServer
from backend.API import fetch_history, get_current
from backend.cron_updating import Timer

PORT = 9001
IP = '127.0.0.1'


def new_client(client, server):
    print('New client connected')

    res = fetch_history(2000)
    data = [] if not res else res.json().get('Data')
    msg = {
       'type': 'INITIAL_STATE',
       'data': data,
    }
    print(res.json().get('TimeTo'))
    print(int(time.time()))
    server.send_message(client, JSONEncoder().encode(msg))


def update(server):
    print('Sending update', flush=True)
    res = get_current()
    data = {} if not res else res.json()
    msg = {
        'type': 'UPDATE',
        'timestamp': int(time.time()),
        'data': data,
    }
    print(msg, flush=True)
    server.send_message_to_all(JSONEncoder().encode(msg))


def print_clients(server):
    print(server.clients)


def start_server(loglevel=logging.WARNING):
    stop_event = Event()
    stop_event.set()
    server = WebsocketServer(PORT, IP, loglevel)
    timer = Timer(5, update, stop_event, server)
    timer.start()
    timer2 = Timer(30, print_clients, stop_event, server)
    timer2.start()
    server.set_fn_new_client(new_client)
    server.run_forever()
    stop_event.clear()
    print('Gracefully stopping')

