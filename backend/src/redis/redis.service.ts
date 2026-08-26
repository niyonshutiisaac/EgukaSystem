import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis client for cache-aside, rate limiting, refresh-token allowlist and BullMQ.
 * Gracefully degrades: if Redis is unreachable the app still boots (cache/queue
 * fall back to no-op/inline behaviour).
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly url: string;

  constructor(config: ConfigService) {
    this.url = config.get<string>('redis.url') ?? 'redis://localhost:6379';
  }

  onModuleInit(): void {
    try {
      const isTls = this.url.startsWith('rediss://');
      this.client = new Redis(this.url, {
        maxRetriesPerRequest: null,
        lazyConnect: false,
        commandTimeout: 2000,
        // Upstash/Render TLS needs this; ioredis auto-detects rediss:// but be explicit for prod
        ...(isTls ? { tls: {} } : {}),
        retryStrategy: (times) => Math.min(times * 200, 5000),
      });
      this.client.on('error', (err) => {
        this.logger.warn(`Redis error: ${err.message}`);
      });
      this.client.on('ready', () => this.logger.log('Redis connected'));
      this.client.on('end', () => this.logger.warn('Redis connection closed'));
    } catch (err) {
      this.logger.error(`Failed to create Redis client: ${(err as Error).message}`);
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  /** True only when Redis is actually connected (never while retrying). */
  get isAvailable(): boolean {
    return this.client?.status === 'ready';
  }

  get raw(): Redis | null {
    return this.client;
  }

  /** Cache-aside get with JSON deserialization. */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  /** Cache-aside set with TTL (seconds). */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // cache is best-effort
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.client || keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch {
      // best-effort
    }
  }

  /** Delete all keys matching a glob pattern (used for tenant-scoped invalidation). */
  async delPattern(pattern: string): Promise<void> {
    if (!this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // best-effort
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.client) return -1;
    try {
      return await this.client.ttl(key);
    } catch {
      return -1;
    }
  }
}
