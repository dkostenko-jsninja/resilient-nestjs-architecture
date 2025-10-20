import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppConfigModule } from './configs/app/config.module'
import { TasksModule } from './modules/tasks/tasks.module'

@Module({
  imports: [AppConfigModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
