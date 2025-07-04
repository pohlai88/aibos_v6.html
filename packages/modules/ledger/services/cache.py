"""
Enhanced caching utility for performance optimization.
Supports both in-memory and Redis caching with intelligent TTL management.
"""
import time
import json
import hashlib
from functools import wraps
from typing import Any, Optional, Union, Dict, List
import logging

logger = logging.getLogger(__name__)

class EnhancedCache:
    """Enhanced caching with intelligent TTL and performance monitoring."""
    
    def __init__(self, redis_client=None, default_ttl=300):
        self.cache = {}
        self.redis_client = redis_client
        self.default_ttl = default_ttl
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
    
    def _generate_key(self, *args, **kwargs) -> str:
        """Generate a consistent cache key from function arguments."""
        key_data = {
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        key_string = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache with performance tracking."""
        try:
            # Try Redis first if available
            if self.redis_client:
                value = self.redis_client.get(key)
                if value:
                    self.stats['hits'] += 1
                    return json.loads(value)
            
            # Fallback to in-memory cache
            entry = self.cache.get(key)
            if entry and (entry['expires_at'] is None or entry['expires_at'] > time.time()):
                self.stats['hits'] += 1
                return entry['value']
            
            self.stats['misses'] += 1
            return None
            
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
            self.stats['misses'] += 1
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with intelligent TTL management."""
        try:
            ttl = ttl or self.default_ttl
            expires_at = time.time() + ttl if ttl else None
            
            # Store in Redis if available
            if self.redis_client:
                serialized_value = json.dumps(value, default=str)
                self.redis_client.setex(key, ttl, serialized_value)
            
            # Also store in memory for faster access
            self.cache[key] = {
                'value': value,
                'expires_at': expires_at,
                'created_at': time.time(),
                'access_count': 0
            }
            
            self.stats['sets'] += 1
            return True
            
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        try:
            if self.redis_client:
                self.redis_client.delete(key)
            
            if key in self.cache:
                del self.cache[key]
            
            self.stats['deletes'] += 1
            return True
            
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False
    
    def clear(self) -> None:
        """Clear all cached data."""
        self.cache.clear()
        if self.redis_client:
            self.redis_client.flushdb()
        logger.info("Cache cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics."""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.stats,
            'hit_rate': round(hit_rate, 2),
            'total_requests': total_requests,
            'memory_entries': len(self.cache)
        }
    
    def cleanup_expired(self) -> int:
        """Remove expired entries from memory cache."""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self.cache.items()
            if entry['expires_at'] and entry['expires_at'] <= current_time
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
        
        return len(expired_keys)
    
    def cache_result(self, ttl: Optional[int] = None, key_prefix: str = ""):
        """Decorator for caching function results with intelligent key generation."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = f"{key_prefix}:{func.__module__}:{func.__name__}:{self._generate_key(*args, **kwargs)}"
                
                # Try to get from cache
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Execute function and cache result
                result = func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                return result
            
            return wrapper
        return decorator

# Global cache instance
_cache_instance = None

def get_cache() -> EnhancedCache:
    """Get the global cache instance."""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = EnhancedCache()
    return _cache_instance

def cache_result(ttl: Optional[int] = None, key_prefix: str = ""):
    """Convenience decorator using global cache instance."""
    return get_cache().cache_result(ttl, key_prefix)

# Performance monitoring decorator
def monitor_performance(func):
    """Decorator to monitor function performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        start_memory = _get_memory_usage()
        
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            end_time = time.time()
            end_memory = _get_memory_usage()
            
            duration = end_time - start_time
            memory_delta = end_memory - start_memory
            
            # Log performance metrics
            logger.info(f"Function {func.__name__} completed in {duration:.3f}s, "
                       f"memory delta: {memory_delta:.2f}MB")
            
            # Alert on slow performance
            if duration > 1.0:  # 1 second threshold
                logger.warning(f"Slow function execution: {func.__name__} took {duration:.3f}s")
    
    return wrapper

def _get_memory_usage() -> float:
    """Get current memory usage in MB."""
    try:
        import psutil
        return psutil.Process().memory_info().rss / 1024 / 1024
    except ImportError:
        return 0.0
