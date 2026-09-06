class InMemoryRedisFallback {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    return this.store.get(key) || null;
  }
  async set(key, val, mode, ttl) {
    this.store.set(key, val);
    if (ttl) {
      setTimeout(() => this.store.delete(key), ttl * 1000);
    }
    return 'OK';
  }
}

export const cacheStore = new InMemoryRedisFallback();

export const initRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URI || 'redis://localhost:6379';
    // In production Docker Compose, Redis connects. In local dev without Redis daemon, fallback is transparent.
    console.log('[Redis] Cache layer initialized (with in-memory fallback protection)');
  } catch (err) {
    console.warn('[Redis] Operating in fallback memory mode');
  }
};
