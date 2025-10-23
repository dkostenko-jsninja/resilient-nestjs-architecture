import { Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { CreateTaskInput, Task, UpdateTaskInput } from '../../../domain/task.entity'
import { TaskRepository } from '../../../domain/task.repository'
import { TaskEntity } from './task.entity'

export const POSTGRES_TASK_REPOSITORY = Symbol('POSTGRES_TASK_REPOSITORY')

@Injectable()
export class PostgresTaskRepository implements TaskRepository {
  constructor(@Inject(POSTGRES_TASK_REPOSITORY) private readonly taskRepository: Repository<TaskEntity>) {}

  async findAll(): Promise<Task[]> {
    const entities = await this.taskRepository.find()
    return entities.map((entity) => new Task(entity))
  }

  async findById(id: string): Promise<Task | null> {
    const entity = await this.taskRepository.findOneBy({ id })
    return entity ? new Task(entity) : null
  }

  async createOne(task: CreateTaskInput): Promise<Task> {
    const entity = this.taskRepository.create(task)
    const saved = await this.taskRepository.save(entity)
    return new Task(saved)
  }

  async updateOne(id: string, changes: UpdateTaskInput): Promise<Task | null> {
    const { affected } = await this.taskRepository.update({ id }, changes)
    if (affected) {
      return await this.findById(id)
    }
    return null
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.taskRepository.delete({ id })
    return !!result.affected
  }
}
