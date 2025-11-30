import { Injectable } from '@nestjs/common'
import { TransientInfrastructureError } from 'src/common/errors/transient-infrastructure.error'
import { Message } from 'src/common/interface/messaging/message'
import { MessageQueue } from 'src/common/interface/messaging/message-subscriber.service'
import { TaskService } from '../../application/task.service'
import { Task } from '../../domain/task.entity'
import { TaskMessage, TaskMessageStatus } from './task-message'
import { TaskMessageStateService } from './task-message-state.service'

@Injectable()
export class TaskMessageProcessorService {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskMessageStateService: TaskMessageStateService,
  ) {}

  async handle(queue: MessageQueue, message: Message) {
    const { key, payload } = message as TaskMessage

    let result: Task | boolean | null = null
    if (queue === 'main') {
      try {
        const state = await this.taskMessageStateService.getState(payload.id)
        if (!state || state.status !== 'pending') {
          return
        }

        await this.taskMessageStateService.updateState({ id: state.id, status: TaskMessageStatus.IN_PROGRESS })

        switch (key) {
          case 'create':
            result = await this.taskService.createOne(payload.data)
            break
          case 'update':
            result = await this.taskService.updateOne(payload.data.id, payload.data.changes)
            break
          case 'delete':
            await this.taskService.deleteOne(payload.data.id)
            result = true
            break
        }
      } catch (error) {
        if (error instanceof TransientInfrastructureError) {
          await this.taskMessageStateService.updateState({ id: payload.id, status: TaskMessageStatus.PENDING })
        }
        throw error
      }
    }

    await this.taskMessageStateService.updateState({
      id: payload.id,
      status: result ? TaskMessageStatus.COMPLETED : TaskMessageStatus.FAILED,
      result: result instanceof Task ? result : undefined,
    })
  }
}
