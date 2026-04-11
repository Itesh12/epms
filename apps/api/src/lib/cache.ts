import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis | null = null;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('error', (err) => {
    console.warn('⚠️ Redis connection error. Caching disabled.', err.message);
  });
} catch (error) {
  console.warn('⚠️ Redis not available.');
}

export const getCache = async (key: string) => {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
};

export const setCache = async (key: string, value: string, ttlSeconds = 3600) => {
  if (!redis) return;
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    // fallback
  }
};

export const deleteCache = async (key: string) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // fallback
  }
};

export default redis;
