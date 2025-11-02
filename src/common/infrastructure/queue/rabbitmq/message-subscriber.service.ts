import { Channel, ConsumeMessage } from 'amqplib'
import { Message } from 'src/common/application/message'
import { MessageQueue, MessageSubscriberService } from 'src/common/application/message-subscriber.service'
import { assertMessageHeaders } from './message-headers'
import { RabbitMqRoutingKeys } from './rabbitmq.types'

export class RabbitMqSubscriberService implements MessageSubscriberService {
  constructor(
    private readonly channel: Channel,
    private readonly mainQueue: string,
    private readonly deadLetterQueue: string,
    private readonly routingKeys: RabbitMqRoutingKeys,
  ) {}

  async subscribe(queue: MessageQueue, handler: (message: Message) => Promise<void> | void): Promise<void> {
    await this.channel.consume(queue === 'dead-letter' ? this.deadLetterQueue : this.mainQueue, async (message: ConsumeMessage | null) => {
      if (!message) {
        return
      }

      try {
        const key = Object.keys(this.routingKeys).find((k) => this.routingKeys[k] === message.fields.routingKey)!
        const payload = JSON.parse(message.content.toString())

        await handler({ key, payload })

        this.channel.ack(message)
      } catch (error) {
        if (queue === 'dead-letter') {
          return this.channel.ack(message)
        }

        const { headers } = message.properties
        try {
          assertMessageHeaders(headers)

          const retryCount = Number(headers['x-retry-count'] ?? 0)
          const maxRetries = Number(headers['x-max-retries'] ?? 0)
          const baseDelayMs = Number(headers['x-base-delay-ms'] ?? 0)
          const maxDelayMs = Number(headers['x-max-delay-ms'] ?? 0)

          if (retryCount < maxRetries) {
            const exp = Math.min(baseDelayMs * 2 ** retryCount, maxDelayMs)
            const delay = Math.floor(exp / 2 + (Math.random() * exp) / 2)
            const published = this.channel.publish(message.fields.exchange, message.fields.routingKey, message.content, {
              headers: {
                ...headers,
                'x-retry-count': retryCount + 1,
                'x-delay': delay,
              },
              persistent: true,
            })

            if (published) {
              return this.channel.ack(message)
            }
          }

          this.channel.reject(message, false)
        } catch (error) {
          this.channel.reject(message, false)
        }
      }
    })
  }

  async unsubscribe(): Promise<void> {
    await this.channel.close()
  }
}
