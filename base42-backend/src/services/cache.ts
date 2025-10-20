import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

// Initialize Redis connection
export const initializeCache = async (): Promise<void> => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    throw error;
  }
};

// Get value from cache
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redisClient) {
    console.warn('Redis client not initialized');
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

// Set value in cache with TTL (time to live in seconds)
export const setCache = async (key: string, value: any, ttl: number = 300): Promise<boolean> => {
  if (!redisClient) {
    console.warn('Redis client not initialized');
    return false;
  }

  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.setEx(key, ttl, serializedValue);
    return true;
  } catch (error) {
    console.error('Error setting cache:', error);
    return false;
  }
};

// Delete value from cache
export const deleteCache = async (key: string): Promise<boolean> => {
  if (!redisClient) {
    console.warn('Redis client not initialized');
    return false;
  }

  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
};

// Clear all cache (use with caution)
export const clearCache = async (): Promise<boolean> => {
  if (!redisClient) {
    console.warn('Redis client not initialized');
    return false;
  }

  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Close Redis connection
export const closeCache = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Check if cache is available
export const isCacheAvailable = (): boolean => {
  return redisClient !== null && redisClient.isOpen;
};