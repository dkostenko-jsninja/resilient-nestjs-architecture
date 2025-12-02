import { Module } from '@nestjs/common'
import { RabbitMqFeatureModule } from 'src/common/infrastructure/messaging/rabbitmq/rabbitmq.module'
import { TASK_MESSAGING_CONFIG } from './infrastructure/messaging/rabbitmq/task-messaging.config'
import { TaskController } from './interface/api/http/rest/task.controller'
import { TaskMessagePublisherService } from './interface/messaging/task-message-publisher.service'
import { TasksCommonModule } from './tasks-common.module'

@Module({
  imports: [TasksCommonModule, RabbitMqFeatureModule.forPublisherFeature(TASK_MESSAGING_CONFIG)],
  controllers: [TaskController],
  providers: [TaskMessagePublisherService],
})
export class TasksModule {}
