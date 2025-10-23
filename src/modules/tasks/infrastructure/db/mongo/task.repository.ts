import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { CreateTaskInput, Task, UpdateTaskInput } from 'src/modules/tasks/domain/task.entity'
import { TaskRepository } from 'src/modules/tasks/domain/task.repository'
import { TASK_MODEL } from './task.schema'

@Injectable()
export class MongoTaskRepository implements TaskRepository {
  constructor(@Inject(TASK_MODEL) private readonly taskModel: Model<Task>) {}

  async findAll(): Promise<Task[]> {
    const docs = await this.taskModel.find().exec()
    return docs.map((doc) => doc.toObject())
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await this.taskModel.findById(id).exec()
    return doc ? doc.toObject() : null
  }

  async createOne(task: CreateTaskInput): Promise<Task> {
    const doc = await this.taskModel.create(task)
    return doc.toObject()
  }

  async updateOne(id: string, changes: UpdateTaskInput): Promise<Task | null> {
    if (!Object.keys(changes).length) {
      const current = await this.findById(id)
      return current
    }
    const doc = await this.taskModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).exec()
    return doc ? doc.toObject() : null
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec()
    return !!result
  }
}
