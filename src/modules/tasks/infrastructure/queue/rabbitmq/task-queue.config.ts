import { RabbitMqFeatureConfig } from 'src/common/infrastructure/queue/rabbitmq/rabbitmq.types'
import { TaskMessage } from 'src/modules/tasks/application/messaging/task-message'

export const TASK_QUEUE_CONFIG: RabbitMqFeatureConfig<TaskMessage['key']> = {
  feature: 'tasks',
  keys: ['create', 'update', 'delete'],
}
