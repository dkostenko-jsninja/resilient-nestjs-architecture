import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CircuitBreakerModule } from './common/infrastructure/circuit-breaker/circuit-breaker.module'
import { AppConfigModule } from './configs/app/config.module'
import { CacheModule } from './modules/cache/cache.module'
import { IdempotencyModule } from './modules/idempotency/idempotency.module'
import { TasksModule } from './modules/tasks/tasks.module'

@Module({
  imports: [AppConfigModule, CacheModule, IdempotencyModule, CircuitBreakerModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
