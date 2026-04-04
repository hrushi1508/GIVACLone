import time

class SimpleCache:
    def __init__(self, expiry_seconds=300):
        self.data = None
        self.expiry = expiry_seconds
        self.last_updated = 0

    def get(self):
        if self.data and (time.time() - self.last_updated < self.expiry):
            return self.data
        return None

    def set(self, data):
        self.data = data
        self.last_updated = time.time()