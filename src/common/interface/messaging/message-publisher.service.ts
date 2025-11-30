import { Message } from './message'

export const MESSAGE_PUBLISHER_SERVICE = Symbol('MESSAGE_PUBLISHER_SERVICE')

export interface MessagePublishOptions {
  delayMs?: number
  retryPolicy?: {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
  }
}

export interface MessagePublisherService {
  publish(message: Message, options?: MessagePublishOptions): Promise<void>
}
