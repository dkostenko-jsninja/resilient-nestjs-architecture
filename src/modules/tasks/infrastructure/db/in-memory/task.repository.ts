import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { CommonInMemoryRepository } from 'src/common/infrastructure/db/in-memory/repository'
import { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from 'src/modules/tasks/domain/task.entity'
import { TaskRepository } from 'src/modules/tasks/domain/task.repository'

@Injectable()
export class InMemoryTaskRepository extends CommonInMemoryRepository<Task, CreateTaskInput, UpdateTaskInput> implements TaskRepository {
  constructor() {
    super(
      (input) =>
        new Task({
          id: randomUUID(),
          name: input.name,
          status: input.status ?? TaskStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      (task) => new Task(task),
    )
  }
}
