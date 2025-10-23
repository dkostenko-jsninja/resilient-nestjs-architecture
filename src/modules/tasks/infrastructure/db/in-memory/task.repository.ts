import { randomUUID } from 'crypto'
import { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from 'src/modules/tasks/domain/task.entity'
import { TaskRepository } from 'src/modules/tasks/domain/task.repository'

export class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>()

  async findAll(): Promise<Task[]> {
    return [...this.tasks.values()]
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null
  }

  async createOne(task: CreateTaskInput): Promise<Task> {
    const createdTask = new Task({
      id: randomUUID(),
      name: task.name,
      status: task.status ?? TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    this.tasks.set(createdTask.id, createdTask)
    return createdTask
  }

  async updateOne(id: string, changes: UpdateTaskInput): Promise<Task | null> {
    const task = await this.findById(id)
    if (!task) {
      return null
    }
    const nextTask = new Task({
      ...task,
      ...changes,
      updatedAt: new Date(),
    })
    this.tasks.set(id, nextTask)
    const updatedTask = await this.findById(task.id)
    return updatedTask!
  }

  async deleteOne(id: string): Promise<boolean> {
    return this.tasks.delete(id)
  }
}
