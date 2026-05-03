# cache.py
from __future__ import annotations

from typing import Any, Dict, Optional


class Cache:
    """
    Simple in-memory cache implementation.
    Can be replaced with Redis or other cache backend.
    """
    
    def __init__(self, enabled: bool = True, default_ttl_seconds: int = 604800):
        self.enabled = enabled
        self.default_ttl = default_ttl_seconds
        self._store: Dict[str, Dict[str, Any]] = {}
    
    async def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get value from cache."""
        if not self.enabled:
            return None
        
        if key in self._store:
            entry = self._store[key]
            # Simple TTL check (in production, use proper expiration)
            return entry.get("value")
        return None
    
    async def setex(self, key: str, ttl: Optional[int], value: Dict[str, Any]) -> None:
        """Set value in cache with optional TTL."""
        if not self.enabled:
            return
        
        self._store[key] = {
            "value": value,
            "ttl": ttl or self.default_ttl,
        }
    
    async def delete(self, key: str) -> None:
        """Delete key from cache."""
        if key in self._store:
            del self._store[key]
    
    async def clear(self) -> None:
        """Clear all cache entries."""
        self._store.clear()


async def init_cache(enabled: bool = True, default_ttl_seconds: int = 604800) -> Cache:
    """Initialize cache instance."""
    return Cache(enabled=enabled, default_ttl_seconds=default_ttl_seconds)


async def close_cache(cache: Cache) -> None:
    """Close cache connection (no-op for in-memory cache)."""
    await cache.clear()
