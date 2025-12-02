import { Module, Provider } from '@nestjs/common'
import { CacheMetricService } from 'src/common/application/cache/cache-metric.service'
import { OTelCounterMetricService } from 'src/common/infrastructure/telemetry/metrics/counter-metric.service'
import { CommonMetricAttributes, METRIC_DEFINITIONS } from 'src/common/infrastructure/telemetry/telemetry.constants'
import { TaskCacheScenario, TaskCacheService } from './application/task-cache.service'
import { TaskService } from './application/task.service'
import { TaskMessageStateService } from './interface/messaging/task-message-state.service'
import { TasksRepositoryModule } from './tasks-repository.module'

const PROVIDERS: Provider[] = [
  {
    provide: CacheMetricService,
    useFactory: () => {
      const cacheHits = new OTelCounterMetricService(METRIC_DEFINITIONS.CACHE_HITS)
      const cacheMisses = new OTelCounterMetricService(METRIC_DEFINITIONS.CACHE_MISSES)

      return new CacheMetricService<
        TaskCacheScenario,
        CommonMetricAttributes<typeof METRIC_DEFINITIONS.CACHE_HITS, typeof METRIC_DEFINITIONS.CACHE_MISSES>
      >(cacheHits, cacheMisses, {
        'get-one': { entity: 'task', scope: 'single' },
        'get-all': { entity: 'task', scope: 'all' },
      })
    },
  },
  TaskCacheService,
  TaskMessageStateService,
  TaskService,
]

@Module({
  imports: [TasksRepositoryModule],
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class TasksCommonModule {}
