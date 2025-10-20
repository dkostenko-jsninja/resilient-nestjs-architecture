import { Task, TaskStatus } from '../../../entities/task.entity'
import { TaskRepository } from '../../../entities/task.repository'

export class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>()

  async findAll(): Promise<Task[]> {
    return [...this.tasks.values()]
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null
  }

  async createOne(task: Task): Promise<Task> {
    const createdTask: Task = {
      ...task,
      id: String(this.tasks.size + 1),
      status: task.status || TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.tasks.set(createdTask.id, createdTask)
    return createdTask
  }

  async updateOne(id: string, changes: Partial<Task>): Promise<Task | null> {
    const task = await this.findById(id)
    if (!task) {
      return null
    }
    this.tasks.set(id, { ...task, ...changes, updatedAt: new Date() })
    const updatedTask = await this.findById(task.id)
    return updatedTask!
  }

  async deleteOne(id: string): Promise<void> {
    this.tasks.delete(id)
  }
}
