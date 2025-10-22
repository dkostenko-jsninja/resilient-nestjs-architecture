export const CACHE_SERVICE = Symbol('CACHE_SERVICE')

export type CacheWriteMode = 'always' | 'ifNotExists' | 'ifExists'
export type CacheTtlMode = 'milliseconds' | 'seconds'

export interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<boolean>
  set<T>(key: string, value: T, writeMode: CacheWriteMode): Promise<boolean>
  set<T>(key: string, value: T, writeMode: CacheWriteMode, ttlMode: CacheTtlMode, ttl: number): Promise<boolean>
  remove(key: string): Promise<void>
}
