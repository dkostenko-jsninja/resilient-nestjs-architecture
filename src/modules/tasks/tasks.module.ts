import { Module } from '@nestjs/common'
import { PostgresConfigModule } from 'src/configs/postgres/config.module'
import { POSTGRES_DATA_SOURCE } from 'src/configs/postgres/constants'
import { DataSource } from 'typeorm'
import { TaskController } from './api/http/rest/task.controller'
import { TASK_REPOSITORY } from './entities/task.repository'
import { TaskEntity } from './infrastructure/db/postgres/task.entity'
import { POSTGRES_TASK_REPOSITORY, PostgresTaskRepository } from './infrastructure/db/postgres/task.repository'
import { TaskService } from './services/task.service'

@Module({
  imports: [
    // MongoConfigModule, // Uncomment if you want to use MongoDB
    PostgresConfigModule,
  ],
  controllers: [TaskController],
  providers: [
    // Uncomment if you want to use MongoDB
    // {
    //   provide: TASK_MODEL,
    //   useFactory: (connection: Connection) => connection.model(TASK_MODEL_NAME, taskSchema),
    //   inject: [MONGO_CONNECTION],
    // },
    {
      provide: POSTGRES_TASK_REPOSITORY,
      useFactory: (dataSource: DataSource) => dataSource.getRepository(TaskEntity),
      inject: [POSTGRES_DATA_SOURCE],
    },
    {
      provide: TASK_REPOSITORY,
      useClass: PostgresTaskRepository,
      // useClass: InMemoryTaskRepository // Uncomment if you want to use In-Memory DB
      // useClass: MongoTaskRepository // Uncomment if you want to use MongoDB
    },

    TaskService,
  ],
})
export class TasksModule {}
