import { Inject, Injectable } from '@nestjs/common'
import { CreateTaskInput, Task, UpdateTaskInput } from '../domain/task.entity'
import { TASK_REPOSITORY, type TaskRepository } from '../domain/task.repository'
import { TaskCacheService } from './task-cache.service'

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    private readonly taskCacheService: TaskCacheService,
  ) {}

  async getAll(): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.findAll()
      this.taskCacheService.setAll(tasks)
      return tasks
    } catch (error) {
      const tasks = await this.taskCacheService.getAll()
      if (tasks) {
        return tasks
      }
      throw error
    }
  }

  async getOne(id: string): Promise<Task | null> {
    try {
      const task = await this.taskRepository.findById(id)
      if (task) {
        this.taskCacheService.setOne(task)
      }
      return task
    } catch (error) {
      const task = await this.taskCacheService.getOne(id)
      if (task) {
        return task
      }
      throw error
    }
  }

  async createOne(task: CreateTaskInput): Promise<Task> {
    const createdTask = await this.taskRepository.createOne(task)
    this.taskCacheService.deleteAll()
    return createdTask
  }

  async updateOne(id: string, changes: UpdateTaskInput): Promise<Task | null> {
    const updatedTask = await this.taskRepository.updateOne(id, changes)
    this.taskCacheService.deleteOne(id)
    return updatedTask
  }

  /**
   * @returns true if an element and has been removed, or false if the element does not exist.
   */
  async deleteOne(id: string): Promise<boolean> {
    const isDeleted = await this.taskRepository.deleteOne(id)
    this.taskCacheService.deleteOne(id)
    return isDeleted
  }
}
