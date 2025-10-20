export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export class Task {
  id: string
  name: string
  status: TaskStatus
  createdAt: Date
  updatedAt: Date

  constructor(task: Task) {
    this.id = task.id
    this.name = task.name
    this.status = task.status
    this.createdAt = task.createdAt
    this.updatedAt = task.updatedAt
  }
}
