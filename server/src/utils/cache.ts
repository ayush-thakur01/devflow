class MemoryCache {
  store: Map<any, any>;
  hits: number;
  misses: number;
  constructor() {
    this.store = new Map()
    this.hits = 0
    this.misses = 0
  }

  get(key) {
    const entry = this.store.get(key)
    if (!entry) { this.misses++; return null }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      this.misses++
      return null
    }
    this.hits++
    return entry.value
  }

  set(key, value, ttlMs = 60000) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  del(key) {
    this.store.delete(key)
  }

  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }

  stats() {
    const total = this.hits + this.misses
    return {
      keys: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? Math.round((this.hits / total) * 100) : 0,
    }
  }

  flush() {
    this.store.clear()
    this.hits = 0
    this.misses = 0
  }
}

const cache = new MemoryCache()

const cacheMiddleware = (keyFn, ttlMs = 60000) => {
  return (req, res, next) => {
    const key = typeof keyFn === 'function' ? keyFn(req) : keyFn
    const cached = cache.get(key)
    if (cached) {
      res.setHeader('X-Cache', 'HIT')
      return res.success(cached.data, cached.message || 'Success')
    }
    const originalSuccess = res.success.bind(res)
    res.success = (data, message, statusCode) => {
      cache.set(key, { data, message }, ttlMs)
      res.setHeader('X-Cache', 'MISS')
      return originalSuccess(data, message, statusCode)
    }
    next()
  }
}

export { cache, cacheMiddleware }
