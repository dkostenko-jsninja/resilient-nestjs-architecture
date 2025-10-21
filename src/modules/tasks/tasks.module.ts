import { Module } from '@nestjs/common'
import { Connection } from 'mongoose'
import { MongoConfigModule } from 'src/configs/mongo/config.module'
import { MONGO_CONNECTION } from 'src/configs/mongo/constants'
import { TaskController } from './api/http/rest/task.controller'
import { TASK_REPOSITORY } from './entities/task.repository'
import { MongoTaskRepository } from './infrastructure/db/mongo/task.repository'
import { TASK_MODEL, TASK_MODEL_NAME, taskSchema } from './infrastructure/db/mongo/task.schema'
import { TaskService } from './services/task.service'

@Module({
  imports: [MongoConfigModule],
  controllers: [TaskController],
  providers: [
    {
      provide: TASK_MODEL,
      useFactory: (connection: Connection) => connection.model(TASK_MODEL_NAME, taskSchema),
      inject: [MONGO_CONNECTION],
    },
    { provide: TASK_REPOSITORY, useClass: MongoTaskRepository },
    TaskService,
  ],
})
export class TasksModule {}
