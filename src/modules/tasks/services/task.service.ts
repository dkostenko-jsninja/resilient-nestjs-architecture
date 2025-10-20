import { Inject, Injectable } from '@nestjs/common'
import { Task } from '../entities/task.entity'
import { TASK_REPOSITORY, type TaskRepository } from '../entities/task.repository'

@Injectable()
export class TaskService {
  constructor(@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository) {}

  async getAll(): Promise<Task[]> {
    return await this.taskRepository.findAll()
  }

  async getOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findById(id)
  }

  async createOne(task: Task): Promise<Task> {
    return await this.taskRepository.createOne(task)
  }

  async updateOne(id: string, changes: Partial<Task>): Promise<Task | null> {
    return await this.taskRepository.updateOne(id, changes)
  }

  async deleteOne(id: string): Promise<void> {
    return await this.taskRepository.deleteOne(id)
  }
}
