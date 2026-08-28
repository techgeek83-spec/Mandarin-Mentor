import os
import time
from typing import Optional, Tuple
from fastapi import Request, HTTPException, status
import redis.asyncio as redis

# Architecture Note: Token-bucket implementation using atomic Redis Lua scripting.
# Accommodates fast micro-player playback while preventing Groq/Gemini API credit exhaustion.
LUA_TOKEN_BUCKET = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])
local ttl = math.ceil(capacity / refill_rate) * 2

local data = redis.call("HMGET", key, "tokens", "last_updated")
local tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

if tokens == nil then
    tokens = capacity
    last_updated = now
else
    local delta = math.max(0, now - last_updated)
    tokens = math.min(capacity, tokens + delta * refill_rate)
end

if tokens >= requested then
    tokens = tokens - requested
    redis.call("HMSET", key, "tokens", tokens, "last_updated", now)
    redis.call("EXPIRE", key, ttl)
    return {1, math.floor(tokens)}
else
    redis.call("HMSET", key, "tokens", tokens, "last_updated", now)
    redis.call("EXPIRE", key, ttl)
    return {0, math.floor(tokens)}
end
"""

class RedisTokenBucketLimiter:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.redis: Optional[redis.Redis] = None
        self._lua_script = None

    async def init_redis(self):
        # Architecture Note: Re-use async connection pool across the application lifespan.
        if not self.redis:
            self.redis = redis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
            self._lua_script = self.redis.register_script(LUA_TOKEN_BUCKET)

    async def close(self):
        if self.redis:
            await self.redis.close()

    def _extract_identifier(self, request: Request) -> str:
        # Architecture Note: Prefers User ID from auth header; falls back to client IP for Alpha testers.
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            return f"user:{token[:16]}" # Placeholder for decoded JWT sub
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"
        return f"ip:{request.client.host if request.client else '127.0.0.1'}"

    async def check_rate_limit(self, request: Request, capacity: int, refill_rate: float, cost: int = 1) -> None:
        if not self.redis or not self._lua_script:
            await self.init_redis()

        identifier = self._extract_identifier(request)
        route_key = f"ratelimit:{identifier}:{request.url.path}"
        now = time.time()

        # Architecture Note: Fails open on local dev connection failure so missing Redis service does not crash local core runtime.
        try:
            allowed, remaining = await self._lua_script(
                keys=[route_key],
                args=[capacity, refill_rate, now, cost]
            )
        except (redis.ConnectionError, redis.TimeoutError, OSError) as e:
            print(f"[RateLimiter Warning] Redis unavailable ({e}). Bypassing rate limit for request.")
            return

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait before generating additional audio or text.",
                headers={"Retry-After": str(int(1 / refill_rate))}
            )

limiter = RedisTokenBucketLimiter()

# Architecture Note: Factory function creating FastAPI route-level dependencies that resolve the active HTTP Request cleanly.
def rate_limit(capacity: int, refill_rate: float, cost: int = 1):
    async def dependency(request: Request):
        await limiter.check_rate_limit(request, capacity=capacity, refill_rate=refill_rate, cost=cost)
    return dependency