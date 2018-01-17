from threading import Timer as PTimer, Event


class Timer:
    def __init__(self, interval, fn, event, *args, **kwargs):
        self.interval = interval
        self.fn = fn
        self.args = args
        self.kwargs = kwargs
        self.event = event
        self.cron_event = Event()

    def run(self):
        self.fn(*self.args, **self.kwargs)

    def init(self):
        while self.event.is_set():
            try:
                self.cron_event.wait(self.interval)
                PTimer(0, self.run).start()
            except KeyboardInterrupt:
                pass

    def start(self):
        if self.event.is_set():
            PTimer(0, self.init).start()
