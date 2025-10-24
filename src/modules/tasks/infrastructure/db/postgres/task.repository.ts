import { Inject, Injectable } from '@nestjs/common'
import { CommonPostgresRepository } from 'src/common/infrastructure/db/postgres/repository'
import { CreateTaskInput, Task, UpdateTaskInput } from 'src/modules/tasks/domain/task.entity'
import { TaskRepository } from 'src/modules/tasks/domain/task.repository'
import { Repository } from 'typeorm'
import { TaskEntity } from './task.entity'

export const POSTGRES_TASK_REPOSITORY = Symbol('POSTGRES_TASK_REPOSITORY')

@Injectable()
export class PostgresTaskRepository
  extends CommonPostgresRepository<Task, CreateTaskInput, UpdateTaskInput, TaskEntity>
  implements TaskRepository
{
  constructor(@Inject(POSTGRES_TASK_REPOSITORY) taskRepository: Repository<TaskEntity>) {
    super(taskRepository, (entity) => new Task(entity))
  }
}
