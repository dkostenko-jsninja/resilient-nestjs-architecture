import { CommonRepository } from 'src/common/domain/repository'
import { CreateTaskInput, Task, UpdateTaskInput } from './task.entity'

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY')

export interface TaskRepository extends CommonRepository<Task, CreateTaskInput, UpdateTaskInput> {}
