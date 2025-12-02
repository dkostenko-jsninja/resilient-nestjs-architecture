import { Inject, Injectable, Logger } from '@nestjs/common'
import { CacheMetricService } from 'src/common/application/cache/cache-metric.service'
import { CACHE_SERVICE, CacheService } from 'src/common/application/cache/cache.service'
import { Task } from '../domain/task.entity'

export type TaskCacheScenario = 'get-one' | 'get-all'

@Injectable()
export class TaskCacheService {
  private readonly logger = new Logger(TaskCacheService.name)
  private readonly TTL_S = 120

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
    setImmediate(() => this.set('all', tasks))
  }

  setOne(task: Task): void {
    setImmediate(() => this.set(task.id, task))
  }

  deleteOne(id: string): void {
    setImmediate(() => {
      this.del(id)
      this.del('all')
    })
  }

  deleteAll(): void {
    setImmediate(() => this.del('all'))
  }

  private set(id: 'all' | string, payload: Task | Task[]): void {
    this.cacheService.set(this.buildCacheKey(id), payload, 'always', 'seconds', this.TTL_S).catch((error) => {
      this.logger.error(error)
    })
  }

  private del(id: 'all' | string): void {
    this.cacheService.del(this.buildCacheKey(id)).catch((error) => {
      this.logger.error(error)
    })
  }

  private buildCacheKey(id: 'all' | string): string {
    return `tasks:${id}`
  }

  private deserializeOne(task: Task): Task {
    return new Task({ ...task, createdAt: new Date(task.createdAt), updatedAt: new Date(task.updatedAt) })
  }
}
