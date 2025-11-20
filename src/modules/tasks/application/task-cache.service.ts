import { Inject, Injectable } from '@nestjs/common'
import { CACHE_SERVICE, CacheService } from 'src/common/application/cache/cache.service'
import { CacheMetricService } from 'src/common/application/cache/cache-metric.service'
import { Task } from '../domain/task.entity'

export type TaskCacheScenario = 'get-one' | 'get-all'

@Injectable()
export class TaskCacheService {
  private readonly TTL = 3600

  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService,
    private readonly cacheMetricService: CacheMetricService<TaskCacheScenario>,
  ) {}

  async getAll(): Promise<Task[] | null> {
    const tasks = await this.cacheService.get<Task[]>(this.buildCacheKey('all'))
    if (tasks) {
      this.cacheMetricService.hit('get-all')
      return tasks.map((task) => this.deserializeOne(task))
    }

    this.cacheMetricService.miss('get-all')
    return null
  }

  async getOne(id: string): Promise<Task | null> {
    const task = await this.cacheService.get<Task>(this.buildCacheKey(id))
    if (task) {
      this.cacheMetricService.hit('get-one')
      return this.deserializeOne(task)
    }

    this.cacheMetricService.miss('get-one')
    return null
  }

  setAll(tasks: Task[]): void {
    this.set('all', tasks)
  }

  setOne(task: Task): void {
    this.set(task.id, task)
  }

  deleteOne(id: string): void {
    this.del(id)
    this.del('all')
  }

  deleteAll(): void {
    this.del('all')
  }

  private set(id: 'all' | string, payload: Task | Task[]): void {
    this.cacheService.set(this.buildCacheKey(id), payload, 'always', 'seconds', this.TTL).catch(() => {})
  }

  private del(id: 'all' | string): void {
    this.cacheService.del(this.buildCacheKey(id)).catch(() => {})
  }

  private buildCacheKey(id: 'all' | string): string {
    return `tasks:${id}`
  }

  private deserializeOne(task: Task): Task {
    return new Task({ ...task, createdAt: new Date(task.createdAt), updatedAt: new Date(task.updatedAt) })
  }
}
