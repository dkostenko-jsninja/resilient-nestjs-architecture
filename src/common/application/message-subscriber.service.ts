import { Message } from './message'

export const MESSAGE_SUBSCRIBER_SERVICE = Symbol('MESSAGE_SUBSCRIBER_SERVICE')

export type MessageQueue = 'main' | 'dead-letter'

export interface MessageSubscriberService {
  subscribe(queue: MessageQueue, handler: (message: Message) => Promise<void> | void): Promise<void>
  unsubscribe(): Promise<void>
}
