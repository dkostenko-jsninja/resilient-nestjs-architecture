import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { RedisCacheModule } from './common/infrastructure/cache/redis/cache.module'
import { IdempotencyModule } from './common/interface/api/http/idempotency/idempotency.module'
import { AppConfigModule } from './configs/app/config.module'
import { TasksModule } from './modules/tasks/tasks.module'

@Module({
  imports: [
    AppConfigModule,
    RedisCacheModule,
    // InMemoryCacheModule, // Uncomment if you want to use In-Memory cache
    IdempotencyModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
