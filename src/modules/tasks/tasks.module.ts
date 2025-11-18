import { Module } from '@nestjs/common'
import { RabbitMqFeatureModule } from 'src/common/infrastructure/queue/rabbitmq/rabbitmq.module'
import { TaskMessagePublisherService } from './application/messaging/task-message-publisher.service'
import { TaskMessageStateService } from './application/messaging/task-message-state.service'
import { TaskCacheService } from './application/task-cache.service'
import { TaskService } from './application/task.service'
import { TASK_QUEUE_CONFIG } from './infrastructure/queue/rabbitmq/task-queue.config'
import { TaskController } from './interface/api/http/rest/task.controller'
import { TasksRepositoryModule } from './tasks-repository.module'

@Module({
  imports: [RabbitMqFeatureModule.forPublisherFeature(TASK_QUEUE_CONFIG), TasksRepositoryModule],
  controllers: [TaskController],
  providers: [TaskMessageStateService, TaskMessagePublisherService, TaskCacheService, TaskService],
})
export class TasksModule {}
