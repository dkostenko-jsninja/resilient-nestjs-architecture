import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { CacheService, CacheTtlMode, CacheWriteMode } from 'src/common/services/cache.service'
import { REDIS_CLIENT } from 'src/configs/redis/constants'

@Injectable()
export class RedisCacheService implements CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key)

    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw)
    } catch {
      await this.remove(key)
    }

    return null
  }

  set<T>(key: string, value: T): Promise<boolean>
  set<T>(key: string, value: T, writeMode: CacheWriteMode): Promise<boolean>
  set<T>(key: string, value: T, writeMode: CacheWriteMode, ttlMode: CacheTtlMode, ttl: number): Promise<boolean>
  async set<T>(key: string, value: T, writeMode?: CacheWriteMode, ttlMode?: CacheTtlMode, ttl?: number): Promise<boolean> {
    // ioredis has strict overloads, so we must call exact signatures explicitly

    let result: 'OK' | null = null
    const payload = JSON.stringify(value)

    switch (writeMode) {
      case 'ifExists':
        switch (ttlMode) {
          case 'seconds':
            result = await this.redis.set(key, payload, 'EX', ttl!, 'XX')
            break
          case 'milliseconds':
            result = await this.redis.set(key, payload, 'PX', ttl!, 'XX')
            break
          default:
            result = await this.redis.set(key, payload, 'XX')
            break
        }
        break

      case 'ifNotExists':
        switch (ttlMode) {
          case 'seconds':
            result = await this.redis.set(key, payload, 'EX', ttl!, 'NX')
            break
          case 'milliseconds':
            result = await this.redis.set(key, payload, 'PX', ttl!, 'NX')
            break
          default:
            result = await this.redis.set(key, payload, 'NX')
            break
        }
        break

      default:
        switch (ttlMode) {
          case 'seconds':
            result = await this.redis.set(key, payload, 'EX', ttl!)
            break
          case 'milliseconds':
            result = await this.redis.set(key, payload, 'PX', ttl!)
            break
          default:
            result = await this.redis.set(key, payload)
            break
        }
    }

    return result === 'OK'
  }

  async remove(key: string): Promise<void> {
    await this.redis.del(key)
  }
}
