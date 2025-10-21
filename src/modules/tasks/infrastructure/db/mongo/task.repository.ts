import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { Task } from 'src/modules/tasks/entities/task.entity'
import { TaskRepository } from 'src/modules/tasks/entities/task.repository'
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

  async createOne(task: Task): Promise<Task> {
    const createdTask = new this.taskModel(task)
    const doc = await createdTask.save()
    return doc.toObject()
  }

  async updateOne(id: string, changes: Partial<Task>): Promise<Task | null> {
    const doc = await this.taskModel.findByIdAndUpdate(id, changes, { new: true }).exec()
    return doc ? doc.toObject() : null
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec()
    return !!result
  }
}
