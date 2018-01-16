from requests import request

API_URL = 'https://min-api.cryptocompare.com/'


def fetch_history(limit=50):
    params = {
        'fsym': 'BTC',
        'tsym': 'USD',
        'limit': limit,
    }
    return request('GET', API_URL + 'data/histominute',
                   params=params)


def get_current():
    params = {
        'fsym': 'BTC',
        'tsyms': 'USD',
    }
    return request('GET', API_URL + 'data/price',
                   params=params)