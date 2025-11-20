import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { MESSAGE_SUBSCRIBER_SERVICE, MessageSubscriberService } from 'src/common/application/messaging/message-subscriber.service'
import { RabbitMqFeatureModule } from 'src/common/infrastructure/queue/rabbitmq/rabbitmq.module'
import { TaskMessageProcessorService } from './application/messaging/task-message-processor.service'
import { TASK_QUEUE_CONFIG } from './infrastructure/queue/rabbitmq/task-queue.config'
import { TasksCommonModule } from './tasks-common.module'

@Module({
  imports: [TasksCommonModule, RabbitMqFeatureModule.forSubscriberFeature(TASK_QUEUE_CONFIG)],
  providers: [TaskMessageProcessorService],
})
export class TasksWorkerModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(MESSAGE_SUBSCRIBER_SERVICE) private readonly messageSubscriber: MessageSubscriberService,
    private readonly messageProcessor: TaskMessageProcessorService,
  ) {}

  async onModuleInit() {
    await this.messageSubscriber.subscribe('main', (message) => this.messageProcessor.handle('main', message))
    await this.messageSubscriber.subscribe('dead-letter', (message) => this.messageProcessor.handle('dead-letter', message))
  }

  async onModuleDestroy() {
    await this.messageSubscriber.unsubscribe()
  }
}
