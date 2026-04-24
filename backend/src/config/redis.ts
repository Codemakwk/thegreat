import Redis from 'ioredis';
import env from './env';

let redis: Redis;

try {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.warn('⚠️  Redis connection error (non-fatal):', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
} catch {
  console.warn('⚠️  Redis not available — running without cache');
  // Create a mock redis that does nothing
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
    setex: async () => 'OK',
    quit: async () => 'OK',
    on: () => redis,
  } as unknown as Redis;
}

export default redis;
