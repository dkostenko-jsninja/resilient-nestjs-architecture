import { RabbitMqFeatureConfig } from 'src/common/infrastructure/messaging/rabbitmq/rabbitmq.types'
import { TaskMessage } from 'src/modules/tasks/interface/messaging/task-message'

export const TASK_MESSAGING_CONFIG: RabbitMqFeatureConfig<TaskMessage['key']> = {
  feature: 'tasks',
  keys: ['create', 'update', 'delete'],
}
