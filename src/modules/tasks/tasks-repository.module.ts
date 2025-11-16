import { Module } from '@nestjs/common'
import { withCircuitBreaker } from 'src/common/infrastructure/circuit-breaker/circuit-breaker.provider'
import { CircuitBreakerService } from 'src/common/infrastructure/circuit-breaker/circuit-breaker.service'
import { POSTGRES_DATA_SOURCE, PostgresModule } from 'src/common/infrastructure/db/postgres/postgres.module'
import { DataSource } from 'typeorm'
import { TASK_REPOSITORY, TaskRepository } from './domain/task.repository'
import { TaskEntity } from './infrastructure/db/postgres/task.entity'
import { POSTGRES_TASK_REPOSITORY, PostgresTaskRepository } from './infrastructure/db/postgres/task.repository'

@Module({
  imports: [
    // MongoModule, // Uncomment if you want to use MongoDB
    PostgresModule,
  ],
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
    PostgresTaskRepository,
    // InMemoryTaskRepository, // Uncomment if you want to use In-Memory DB
    // MongoTaskRepository, // Uncomment if you want to use MongoDB
    {
      provide: TASK_REPOSITORY,
      useFactory: (breaker: CircuitBreakerService, repository: TaskRepository) => withCircuitBreaker(breaker, repository),
      inject: [
        CircuitBreakerService,
        PostgresTaskRepository,
        // InMemoryTaskRepository, // Uncomment if you want to use In-Memory DB
        // MongoTaskRepository, // Uncomment if you want to use MongoDB
      ],
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TasksRepositoryModule {}
