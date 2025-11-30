import { CreateTaskInput, Task, UpdateTaskInput } from '../../domain/task.entity'

export enum TaskMessageStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface TaskMessageState {
  id: string
  status: TaskMessageStatus
  result?: Task | undefined
}

type TaskMessagePayloadMap = {
  create: CreateTaskInput
  update: { id: string; changes: UpdateTaskInput }
  delete: { id: string }
}

export type TaskMessageInput = {
  [Key in keyof TaskMessagePayloadMap]: {
    key: Key
    payload: TaskMessagePayloadMap[Key]
  }
}[keyof TaskMessagePayloadMap]

export type TaskMessage = {
  [Key in keyof TaskMessagePayloadMap]: {
    key: Key
    payload: { id: string; data: TaskMessagePayloadMap[Key] }
  }
}[keyof TaskMessagePayloadMap]
