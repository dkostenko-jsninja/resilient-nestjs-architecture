import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { randomUUID } from 'crypto'
import { Task, TaskStatus } from 'src/modules/tasks/entities/task.entity'

@Schema({ timestamps: true })
export class TaskSchema implements Task {
  @Prop({ type: String, default: randomUUID })
  _id: string

  id: string

  @Prop({ type: String })
  name: string

  @Prop({ type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING })
  status: TaskStatus

  createdAt: Date
  updatedAt: Date
}

export const taskSchema = SchemaFactory.createForClass(TaskSchema)

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, task) => new Task(task),
})

taskSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (_, task) => new Task(task),
})

export const TASK_MODEL = Symbol('TASK_MODEL')
export const TASK_MODEL_NAME = 'TASK'
