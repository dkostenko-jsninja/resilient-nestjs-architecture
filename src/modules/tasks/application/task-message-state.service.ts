import { Inject, Injectable } from '@nestjs/common'
import { CACHE_SERVICE, CacheService } from 'src/common/application/cache/cache.service'
import { TaskMessageState } from './task-message'

@Injectable()
export class TaskMessageStateService {
  constructor(@Inject(CACHE_SERVICE) private readonly cache: CacheService) {}

  async setState(state: TaskMessageState): Promise<boolean> {
    return await this.cache.set(this.buildCacheKey(state.id), state, 'always', 'seconds', 3600)
  }

  async getState(id: string): Promise<TaskMessageState | null> {
    return await this.cache.get(this.buildCacheKey(id))
  }

  async updateState(state: TaskMessageState): Promise<boolean> {
    return await this.cache.set(this.buildCacheKey(state.id), state, 'ifExists', 'seconds', 3600)
  }

  private buildCacheKey(id: string): string {
    return `tasks:queued:${id}`
  }
}
