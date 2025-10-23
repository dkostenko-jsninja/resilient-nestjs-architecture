import { Inject, Injectable } from '@nestjs/common'
import { CreateTaskInput, Task, UpdateTaskInput } from '../domain/task.entity'
import { TASK_REPOSITORY, type TaskRepository } from '../domain/task.repository'

@Injectable()
export class TaskService {
  constructor(@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository) {}

  async getAll(): Promise<Task[]> {
    return await this.taskRepository.findAll()
  }

  async getOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findById(id)
  }

  async createOne(task: CreateTaskInput): Promise<Task> {
    return await this.taskRepository.createOne(task)
  }

  async updateOne(id: string, changes: UpdateTaskInput): Promise<Task | null> {
    return await this.taskRepository.updateOne(id, changes)
  }

  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  async deleteOne(id: string): Promise<boolean> {
    return await this.taskRepository.deleteOne(id)
  }
}
