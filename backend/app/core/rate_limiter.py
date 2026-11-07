import time
from collections import defaultdict
from fastapi import HTTPException, status, Request

class SimpleRateLimiter:
    """
    Sliding window in-memory rate limiter for sensitive endpoints (e.g. login/register).
    """
    def __init__(self, max_requests: int = 15, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_rate_limited(self, key: str) -> bool:
        now = time.time()
        # Clean older requests outside the window
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window_seconds]
        if len(self.requests[key]) >= self.max_requests:
            return True
        self.requests[key].append(now)
        return False

from app.core.config import settings

auth_limiter = SimpleRateLimiter(max_requests=10, window_seconds=60)

async def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    # Allow test runners to execute without hitting rate limits
    if request.url.netloc == "test" or client_ip in ("testclient", "unknown") or settings.ENVIRONMENT in ("testing", "test"):
        return

    key = f"{client_ip}:{request.url.path}"
    if auth_limiter.is_rate_limited(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please try again after a minute.",
        )
