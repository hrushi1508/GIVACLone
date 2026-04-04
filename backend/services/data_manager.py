import json
import os
import threading

class DataManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.base_path = os.path.join(os.path.dirname(__file__), '..', 'data')

    def _get_path(self, filename):
        return os.path.join(self.base_path, filename)

    def read(self, filename):
        path = self._get_path(filename)
        with self.lock:
            if not os.path.exists(path):
                return []
            with open(path, 'r') as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return []

    def write(self, filename, data):
        path = self._get_path(filename)
        with self.lock:
            with open(path, 'w') as f:
                json.dump(data, f, indent=4)