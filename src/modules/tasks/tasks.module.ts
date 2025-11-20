import { Module } from '@nestjs/common'
import { RabbitMqFeatureModule } from 'src/common/infrastructure/queue/rabbitmq/rabbitmq.module'
import { TaskMessagePublisherService } from './application/messaging/task-message-publisher.service'
import { TASK_QUEUE_CONFIG } from './infrastructure/queue/rabbitmq/task-queue.config'
import { TaskController } from './interface/api/http/rest/task.controller'
import { TasksCommonModule } from './tasks-common.module'

@Module({
  imports: [TasksCommonModule, RabbitMqFeatureModule.forPublisherFeature(TASK_QUEUE_CONFIG)],
  controllers: [TaskController],
  providers: [TaskMessagePublisherService],
})
export class TasksModule {}
