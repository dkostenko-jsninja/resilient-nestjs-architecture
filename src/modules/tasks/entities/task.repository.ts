import { Task } from './task.entity'

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY')

export interface TaskRepository {
  findAll(): Promise<Task[]>
  findById(id: string): Promise<Task | null>
  createOne(task: Task): Promise<Task>
  updateOne(id: string, changes: Partial<Task>): Promise<Task | null>
  deleteOne(id: string): Promise<void>
}
