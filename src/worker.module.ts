import { Module } from '@nestjs/common'
import { CacheModule } from './common/infrastructure/cache/cache.module'
import { TasksWorkerModule } from './modules/tasks/tasks-worker.module'

@Module({
  imports: [CacheModule, TasksWorkerModule],
})
export class WorkerModule {}
