import { Injectable } from '@nestjs/common'
import { CacheService, CacheTtlMode, CacheWriteMode } from 'src/common/application/cache/cache.service'

interface CacheEntry<T = unknown> {
  value: T
  expiresAt: number | null
}

@Injectable()
export class InMemoryCacheService implements CacheService {
  private readonly cache = new Map<string, CacheEntry>()
  private readonly maxCacheSize = 100

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) {
      return null
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set<T>(key: string, value: T): Promise<boolean>
  set<T>(key: string, value: T, writeMode: CacheWriteMode): Promise<boolean>
  set<T>(key: string, value: T, writeMode: CacheWriteMode, ttlMode: CacheTtlMode, ttl: number): Promise<boolean>
  async set<T>(key: string, value: T, writeMode?: CacheWriteMode, ttlMode?: CacheTtlMode, ttl?: number): Promise<boolean> {
    if (ttlMode) {
      return this.setWithOptions(key, value, ttlMode === 'seconds' ? ttl! * 1000 : ttl, writeMode)
    } else {
      return this.setWithOptions(key, value, null, writeMode)
    }
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key)
  }

  private setWithOptions(key: string, value: unknown, ttlMs?: number | null, writeMode?: CacheWriteMode | null): boolean {
    if ((writeMode === 'ifExists' && !this.cache.has(key)) || (writeMode === 'ifNotExists' && this.cache.has(key))) {
      return false
    }

    if (this.cache.size >= this.maxCacheSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null })
    return true
  }
}
