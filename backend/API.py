from requests import request

API_URL = 'https://min-api.cryptocompare.com/'


def fetch_history(limit=None, period=None, currency=None,
                  output_currency=None):
    if not limit:
        limit = 50
    if not currency:
        currency = 'BTC'
    if not output_currency:
        output_currency = 'USD'
    if not period in ['minute', 'day', 'hour']:
        period = 'minute'
    params = {
        'fsym': currency,
        'tsym': output_currency,
        'limit': limit,
    }
    return request('GET', API_URL + 'data/histo{}'.format(period),
                   params=params)


def get_current(currency=None, output_currency=None):
    if not currency:
        currency = 'BTC'
    if not output_currency:
        output_currency = 'USD'
    params = {
        'fsym': currency,
        'tsyms': output_currency,
    }
    return request('GET', API_URL + 'data/price',
                   params=params)