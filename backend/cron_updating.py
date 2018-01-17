from threading import Timer as PTimer


class Timer:
    def __init__(self, interval, fn, event, *args, **kwargs):
        self.interval = interval
        self.fn = fn
        self.args = args
        self.kwargs = kwargs
        self.event = event

    def run(self):
        self.fn(*self.args, **self.kwargs)
        self.start()

    def start(self):
        if self.event.is_set():
            PTimer(self.interval, self.run).start()