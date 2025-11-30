import { Logger } from '@nestjs/common'
import { Channel, ConsumeMessage } from 'amqplib'
import { Message } from 'src/common/interface/messaging/message'
import { MessageQueue, MessageSubscriberService } from 'src/common/interface/messaging/message-subscriber.service'
import { assertMessageHeaders } from './message-headers'
import { RabbitMqRoutingKeys } from './rabbitmq.types'

type MessageHandler = (message: Message) => Promise<void> | void

export class RabbitMqSubscriberService implements MessageSubscriberService {
  private readonly logger = new Logger(RabbitMqSubscriberService.name)
  private readonly subscriptions: Array<{ queue: MessageQueue; handler: MessageHandler }> = []
  private readonly consumerTags: Set<string> = new Set()

  private channel: Channel | null = null
  private reconnecting = false
  private shuttingDown = false

  constructor(
    private readonly createChannel: () => Promise<Channel>,
    private readonly mainQueue: string,
    private readonly deadLetterQueue: string,
    private readonly routingKeys: RabbitMqRoutingKeys,
  ) {}

  async subscribe(queue: MessageQueue, handler: MessageHandler): Promise<void> {
    this.subscriptions.push({ queue, handler })
    await this.ensureChannel()
    await this.consume(queue, handler)
  }

  async unsubscribe(): Promise<void> {
    this.shuttingDown = true

    if (this.channel) {
      await this.cancelConsumers(this.channel)
      await this.channel.close()
    }
  }

  private async ensureChannel(): Promise<void> {
    if (this.channel || this.shuttingDown) {
      return
    }

    this.channel = await this.createChannel()
    this.channel.on('close', () => this.scheduleReconnect())
    this.channel.on('error', () => this.scheduleReconnect())
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.reconnecting || this.shuttingDown) {
      return
    }

    this.reconnecting = true
    this.logger.warn('RabbitMQ channel closed. Attempting to resubscribe...')

    while (true) {
      try {
        this.channel = null
        await this.ensureChannel()

        for (const { queue, handler } of this.subscriptions) {
          await this.consume(queue, handler)
        }

        this.reconnecting = false
        this.logger.log('RabbitMQ channel resubscribed successfully')
        return
      } catch (error) {
        this.logger.error('RabbitMQ resubscribe failed, retrying in 2s', error)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  private async consume(queue: MessageQueue, handler: MessageHandler): Promise<void> {
    const channel = this.channel
    if (!channel) {
      throw new Error('RabbitMQ channel is not initialized')
    }

    const { consumerTag } = await channel.consume(
      queue === 'dead-letter' ? this.deadLetterQueue : this.mainQueue,
      async (message: ConsumeMessage | null) => {
        if (!message) {
          return
        }

        try {
          const key = Object.keys(this.routingKeys).find((k) => this.routingKeys[k] === message.fields.routingKey)!
          const payload = JSON.parse(message.content.toString())

          await handler({ key, payload })

          channel.ack(message)
        } catch (error) {
          if (queue === 'dead-letter') {
            return channel.ack(message)
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
              const published = channel.publish(message.fields.exchange, message.fields.routingKey, message.content, {
                headers: {
                  ...headers,
                  'x-retry-count': retryCount + 1,
                  'x-delay': delay,
                },
                persistent: true,
              })

              if (published) {
                return channel.ack(message)
              }
            }

            channel.reject(message, false)
          } catch (error) {
            channel.reject(message, false)
          }
        }
      },
    )

    this.consumerTags.add(consumerTag)
  }

  private async cancelConsumers(channel: Channel): Promise<void> {
    for (const tag of this.consumerTags) {
      try {
        await channel.cancel(tag)
      } catch (error) {
        this.logger.warn(`Failed to cancel consumer ${tag}`, error)
      }
    }
    this.consumerTags.clear()
  }
}
