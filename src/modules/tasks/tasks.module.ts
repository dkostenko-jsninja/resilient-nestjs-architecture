import { Module } from '@nestjs/common'
import { TaskController } from './api/http/rest/task.controller'
import { TASK_REPOSITORY } from './entities/task.repository'
import { InMemoryTaskRepository } from './infrastructure/db/in-memory/task.repository'
import { TaskService } from './services/task.service'

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [{ provide: TASK_REPOSITORY, useClass: InMemoryTaskRepository }, TaskService],
})
export class TasksModule {}
