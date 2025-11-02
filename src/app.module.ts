import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CacheModule } from './common/infrastructure/cache/cache.module'
import { IdempotencyModule } from './common/interface/api/http/idempotency/idempotency.module'
import { AppConfigModule } from './configs/app/config.module'
import { TasksModule } from './modules/tasks/tasks.module'

@Module({
  imports: [AppConfigModule, CacheModule, IdempotencyModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
