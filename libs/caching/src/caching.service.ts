import { REDIS_HOST, REDIS_PASS, REDIS_PORT } from 'libs/config';
import { createClient, RedisClientType } from 'redis';

export class CachingService {
  private static _instance: CachingService;
  private readonly _redisClient: RedisClientType;

  private constructor() {
    this._redisClient = createClient({
      password: REDIS_PASS,
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
      // legacyMode: true,
    });

    this._redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  private async connect() {
    if (!this._redisClient.isOpen) {
      try {
        await this._redisClient.connect();
        console.log('Redis client connected successfully');
      } catch (err) {
        console.error('Failed to connect to Redis:', err);
        throw err;
      }
    }
  }

  static getInstance(): CachingService {
    if (this._instance) return this._instance;

    this._instance = new CachingService();
    Object.freeze(this._instance); // Đóng băng đối tượng, ngăn không cho thay đổi.

    return this._instance;
  }

  /**
   * Get cache value by key
   *
   * @param key
   * @returns value as T
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.connect(); // Đảm bảo kết nối trước khi thực hiện thao tác.
      if (this._redisClient.isOpen) {
        const value = await this._redisClient.get(key);
        return value ? (JSON.parse(value) as T) : null;
      } else {
        console.error('Redis client is not connected');
        return null;
      }
    } catch (err) {
      console.error(`Error getting key ${key}:`, err);
      throw err;
    }
  }

  /**
   * Set cache value by key
   *
   * @param key
   * @param value
   * @param exp default 60 seconds
   */
  async set(key: string, value: unknown, exp = 60): Promise<void> {
    if (value === undefined || value === null) return;

    try {
      await this.connect(); // Đảm bảo kết nối trước khi thực hiện thao tác.
      const valStr = JSON.stringify(value, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );

      await this._redisClient.setEx(key, exp, valStr);
    } catch (err) {
      console.error(`Error setting key ${key}:`, err);
      throw err;
    }
  }

  /**
   * Delete cache by key
   *
   * @param key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.connect(); // Đảm bảo kết nối trước khi thực hiện thao tác.
      await this._redisClient.del(key);
    } catch (err) {
      console.error(`Error deleting key ${key}:`, err);
      throw err;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      if (this._redisClient.isOpen) {
        await this._redisClient.quit();
        console.log('Disconnected from Redis successfully');
      }
    } catch (err) {
      console.error('Error disconnecting from Redis:', err);
      throw err;
    }
  }
}
