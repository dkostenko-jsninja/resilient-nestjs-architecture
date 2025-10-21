import { Task } from './task.entity'

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY')

export interface TaskRepository {
  findAll(): Promise<Task[]>
  findById(id: string): Promise<Task | null>
  createOne(task: Task): Promise<Task>
  updateOne(id: string, changes: Partial<Task>): Promise<Task | null>
  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  deleteOne(id: string): Promise<boolean>
}
