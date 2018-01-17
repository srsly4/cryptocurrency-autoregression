import logging

from backend import start_server


def main():
    start_server(logging.INFO)


if __name__ == '__main__':
    main()