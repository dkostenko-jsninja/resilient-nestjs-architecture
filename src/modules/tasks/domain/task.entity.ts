import { CommonEntity } from 'src/common/domain/entity'

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface CreateTaskInput {
  name: string
  status?: TaskStatus
}
export type UpdateTaskInput = Partial<CreateTaskInput>

export class Task implements CommonEntity {
  readonly id: string
  readonly name: string
  readonly status: TaskStatus
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(task: Task) {
    this.id = task.id
    this.name = task.name
    this.status = task.status
    this.createdAt = task.createdAt
    this.updatedAt = task.updatedAt
  }
}
