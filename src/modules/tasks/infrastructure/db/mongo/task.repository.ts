import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { CommonMongoRepository } from 'src/common/infrastructure/db/mongo/repository'
import { CreateTaskInput, Task, UpdateTaskInput } from 'src/modules/tasks/domain/task.entity'
import { TaskRepository } from 'src/modules/tasks/domain/task.repository'
import { TASK_MODEL } from './task.schema'

@Injectable()
export class MongoTaskRepository extends CommonMongoRepository<Task, CreateTaskInput, UpdateTaskInput> implements TaskRepository {
  constructor(@Inject(TASK_MODEL) taskModel: Model<Task>) {
    super(taskModel, (doc) => doc.toObject())
  }
}
