import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { MESSAGE_PUBLISHER_SERVICE, MessagePublisherService } from 'src/common/application/message-publisher.service'
import { TaskMessageInput, TaskMessageState, TaskMessageStatus } from './task-message'
import { TaskMessageStateService } from './task-message-state.service'

@Injectable()
export class TaskMessagePublisherService {
  constructor(
    @Inject(MESSAGE_PUBLISHER_SERVICE)
    private readonly publisher: MessagePublisherService,
    private readonly messageStateService: TaskMessageStateService,
  ) {}

  async enqueue(message: TaskMessageInput): Promise<TaskMessageState> {
    const state: TaskMessageState = { id: randomUUID(), status: TaskMessageStatus.PENDING }
    await this.messageStateService.setState(state)
    await this.publisher.publish(
      { key: message.key, payload: { id: state.id, data: message.payload } },
      {
        delayMs: 5_000,
        retryPolicy: { maxRetries: 3, baseDelayMs: 10_000, maxDelayMs: 30_000 },
      },
    )
    return state
  }
}
