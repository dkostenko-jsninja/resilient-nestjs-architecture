import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { DynamicModule, Module, Provider } from '@nestjs/common'
import { Channel } from 'amqplib'
import { MESSAGE_PUBLISHER_SERVICE } from 'src/common/interface/messaging/message-publisher.service'
import { MESSAGE_SUBSCRIBER_SERVICE } from 'src/common/interface/messaging/message-subscriber.service'
import { RabbitMqConfigModule } from 'src/configs/rabbitmq/config.module'
import { CircuitBreakerModule } from '../../circuit-breaker/circuit-breaker.module'
import { withCircuitBreaker } from '../../circuit-breaker/circuit-breaker.provider'
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service'
import { RabbitMqPublisherService } from './message-publisher.service'
import { RabbitMqSubscriberService } from './message-subscriber.service'
import { RabbitMqFeatureConfig, RabbitMqRoutingKeys } from './rabbitmq.types'

const dlSuffix = '.dl'
const getExchangeKey = (feature: string, dl?: boolean): string => `${feature}.exchange${dl ? dlSuffix : ''}`
const getQueueKey = (feature: string, dl?: boolean): string => `${feature}.queue${dl ? dlSuffix : ''}`
const getRoutingKey = (feature: string, key: string): string => `${feature}.${key}`
const getRoutingKeys = (feature: string, keys: string[]): RabbitMqRoutingKeys =>
  keys.reduce((acc, key) => {
    acc[key] = getRoutingKey(feature, key)
    return acc
  }, {})

@Module({
  imports: [RabbitMqConfigModule, CircuitBreakerModule.forFeature('rabbitmq')],
})
export class RabbitMqFeatureModule {
  static forPublisherFeature({ feature, keys }: RabbitMqFeatureConfig): DynamicModule {
    const exchange = getExchangeKey(feature)
    const routingKeys = getRoutingKeys(feature, keys)

    const providers: Provider[] = [
      {
        provide: MESSAGE_PUBLISHER_SERVICE,
        useFactory: (breaker: CircuitBreakerService, connection: AmqpConnection) =>
          withCircuitBreaker(breaker, new RabbitMqPublisherService(connection, exchange, routingKeys)),
        inject: [CircuitBreakerService, AmqpConnection],
      },
    ]

    return {
      module: RabbitMqFeatureModule,
      providers,
      exports: [MESSAGE_PUBLISHER_SERVICE],
    }
  }

  static forSubscriberFeature({ feature, keys }: RabbitMqFeatureConfig): DynamicModule {
    const exchange = getExchangeKey(feature)
    const queue = getQueueKey(feature)
    const routingKeys = getRoutingKeys(feature, keys)

    const deadLetterExchange = getExchangeKey(feature, true)
    const deadLetterQueue = getQueueKey(feature, true)

    const CHANNEL = `RABBITMQ_${feature.toUpperCase()}_CHANNEL`
    const providers: Provider[] = [
      {
        provide: CHANNEL,
        useFactory: async (connection: AmqpConnection) => {
          const channel = connection.channel
          await channel.assertExchange(exchange, 'x-delayed-message', { durable: true, arguments: { 'x-delayed-type': 'topic' } })
          await channel.assertExchange(deadLetterExchange, 'topic', { durable: true })

          await channel.assertQueue(queue, { durable: true, deadLetterExchange })
          await channel.assertQueue(deadLetterQueue, { durable: true })

          for (const routingKey of Object.values(routingKeys)) {
            await channel.bindQueue(queue, exchange, routingKey)
          }
          await channel.bindQueue(deadLetterQueue, deadLetterExchange, getRoutingKey(feature, '*'))

          return channel
        },
        inject: [AmqpConnection],
      },
      {
        provide: MESSAGE_SUBSCRIBER_SERVICE,
        useFactory: (connection: AmqpConnection) => {
          const createChannel = async (): Promise<Channel> => {
            const channel = connection.channel
            await channel.assertExchange(exchange, 'x-delayed-message', { durable: true, arguments: { 'x-delayed-type': 'topic' } })
            await channel.assertExchange(deadLetterExchange, 'topic', { durable: true })

            await channel.assertQueue(queue, { durable: true, deadLetterExchange })
            await channel.assertQueue(deadLetterQueue, { durable: true })

            for (const routingKey of Object.values(routingKeys)) {
              await channel.bindQueue(queue, exchange, routingKey)
            }
            await channel.bindQueue(deadLetterQueue, deadLetterExchange, getRoutingKey(feature, '*'))

            return channel
          }

          return new RabbitMqSubscriberService(createChannel, queue, deadLetterQueue, routingKeys)
        },
        inject: [AmqpConnection],
      },
    ]

    return {
      module: RabbitMqFeatureModule,
      providers,
      exports: [MESSAGE_SUBSCRIBER_SERVICE],
    }
  }
}
