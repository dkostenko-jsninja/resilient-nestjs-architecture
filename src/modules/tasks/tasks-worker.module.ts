import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { RabbitMqFeatureModule } from 'src/common/infrastructure/messaging/rabbitmq/rabbitmq.module'
import { MESSAGE_SUBSCRIBER_SERVICE, MessageSubscriberService } from 'src/common/interface/messaging/message-subscriber.service'
import { TASK_MESSAGING_CONFIG } from './infrastructure/messaging/rabbitmq/task-messaging.config'
import { TaskMessageProcessorService } from './interface/messaging/task-message-processor.service'
import { TasksCommonModule } from './tasks-common.module'

@Module({
  imports: [TasksCommonModule, RabbitMqFeatureModule.forSubscriberFeature(TASK_MESSAGING_CONFIG)],
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
