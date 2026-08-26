import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../../redis/redis.service';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Redis-backed rate-limit storage — correct across multiple API replicas
 * behind the load balancer. Falls back to per-process in-memory counting
 * when Redis is unavailable.
 */
@Injectable()
export class RedisThrottleStorage implements ThrottlerStorage {
  private readonly memory = new Map<
    string,
    { hits: number; resetAt: number; blockedUntil: number }
  >();

  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const fullKey = `throttle:${throttlerName}:${key}`;

    if (!this.redis.isAvailable) {
      return this.incrementMemory(fullKey, ttl, limit, blockDuration);
    }

    const script = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
      local ttl = redis.call('PTTL', KEYS[1])
      local blocked = redis.call('GET', KEYS[1]..':blocked')
      if blocked then
        local bttl = redis.call('PTTL', KEYS[1]..':blocked')
        return {current, ttl, 1, bttl}
      end
      if current > tonumber(ARGV[2]) then
        redis.call('SET', KEYS[1]..':blocked', '1', 'PX', ARGV[3])
        return {current, ttl, 1, tonumber(ARGV[3])}
      end
      return {current, ttl, 0, -1}
    `;

    const result = (await this.redis.raw!.eval(
      script,
      1,
      fullKey,
      String(ttl * 1000),
      String(limit),
      String(blockDuration * 1000),
    )) as [number, number, number, number];

    return {
      totalHits: result[0],
      timeToExpire: Math.ceil(result[1] / 1000),
      isBlocked: result[2] === 1,
      timeToBlockExpire: result[2] === 1 ? Math.ceil(result[3] / 1000) : 0,
    };
  }

  private incrementMemory(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    const now = Date.now();
    const rec = this.memory.get(key);

    if (rec && rec.resetAt <= now) {
      this.memory.delete(key);
    }

    const current = rec ?? { hits: 0, resetAt: now + ttl * 1000, blockedUntil: 0 };

    if (current.blockedUntil > now) {
      return {
        totalHits: current.hits,
        timeToExpire: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
        isBlocked: true,
        timeToBlockExpire: Math.ceil((current.blockedUntil - now) / 1000),
      };
    }

    current.hits += 1;
    this.memory.set(key, current);

    if (current.hits > limit) {
      current.blockedUntil = now + blockDuration * 1000;
      return {
        totalHits: current.hits,
        timeToExpire: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
        isBlocked: true,
        timeToBlockExpire: blockDuration,
      };
    }

    return {
      totalHits: current.hits,
      timeToExpire: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}
