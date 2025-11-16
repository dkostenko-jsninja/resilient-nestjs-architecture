import { Module } from '@nestjs/common'
import { RedisCacheModule } from './common/infrastructure/cache/redis/cache.module'
import { TasksWorkerModule } from './modules/tasks/tasks-worker.module'

@Module({
  imports: [
    RedisCacheModule,
    // InMemoryCacheModule, // Uncomment if you want to use In-Memory cache
    TasksWorkerModule,
  ],
})
export class WorkerModule {}
