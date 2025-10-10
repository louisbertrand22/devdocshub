import time
from collections import defaultdict, deque
from typing import Deque, Dict

class SimpleRateLimiter:
    def __init__(self, max_calls: int, per_seconds: int):
        self.max_calls = max_calls
        self.per_seconds = per_seconds
        self.hits: Dict[str, Deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.time()
        q = self.hits[key]
        while q and now - q[0] > self.per_seconds:
            q.popleft()
        if len(q) < self.max_calls:
            q.append(now)
            return True
        return False
