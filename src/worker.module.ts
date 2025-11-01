import { Module } from '@nestjs/common'
import { CacheModule } from './common/infrastructure/cache/cache.module'
import { CircuitBreakerModule } from './common/infrastructure/circuit-breaker/circuit-breaker.module'
import { TasksWorkerModule } from './modules/tasks/tasks-worker.module'

@Module({
  imports: [CacheModule, CircuitBreakerModule, TasksWorkerModule],
})
export class WorkerModule {}
