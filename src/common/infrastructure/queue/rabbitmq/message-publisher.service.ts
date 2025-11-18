import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { randomUUID } from 'crypto'
import { Message } from 'src/common/application/messaging/message'
import { MessagePublisherService, MessagePublishOptions } from 'src/common/application/messaging/message-publisher.service'
import { MessageHeaders } from './message-headers'
import { RabbitMqRoutingKeys } from './rabbitmq.types'

export class RabbitMqPublisherService implements MessagePublisherService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly exchange: string,
    private readonly routingKeys: RabbitMqRoutingKeys,
  ) {}

  async publish({ key, payload }: Message, options: MessagePublishOptions = {}): Promise<void> {
    const routingKey = this.routingKeys[key]
    if (!routingKey) {
      throw new Error(`[RabbitMqPublisherService] ${key} key is not registered in ${this.exchange}`)
    }

    const headers: MessageHeaders = {
      'x-message-id': randomUUID(),
    }

    if (options.delayMs) {
      headers['x-delay'] = options.delayMs
    }

    if (options.retryPolicy) {
      const { baseDelayMs, maxDelayMs, maxRetries } = options.retryPolicy
      headers['x-max-retries'] = maxRetries
      headers['x-base-delay-ms'] = baseDelayMs
      headers['x-max-delay-ms'] = maxDelayMs
    }

    await this.amqpConnection.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      headers,
      persistent: true,
    })
  }
}
