from json import JSONEncoder
from threading import Event

import time
from websocket_server import WebsocketServer, logging
from websocket import WebSocket
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
    server.send_message(client, JSONEncoder().encode(msg))


def update(server):
    print('Sending update')
    res = get_current()
    data = {} if not res else res.json()
    msg = {
        'type': 'UPDATE',
        'timestamp': int(time.time()),
        'data': data,
    }
    print(msg)
    server.send_message_to_all(JSONEncoder().encode(msg))


def start_server(loglevel=logging.WARNING):
    stop_event = Event()
    stop_event.set()
    server = WebsocketServer(PORT, IP, loglevel)
    timer = Timer(5, update, stop_event, server)
    timer.start()
    server.set_fn_new_client(new_client)
    server.run_forever()
    stop_event.clear()
    print('Gracefully stopping')

