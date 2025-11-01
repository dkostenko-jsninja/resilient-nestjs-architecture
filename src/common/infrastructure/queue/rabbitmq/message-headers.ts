export interface MessageHeaders {
  'x-message-id': string
  'x-base-delay-ms'?: number
  'x-max-delay-ms'?: number
  'x-max-retries'?: number
  'x-retry-count'?: number
  'x-delay'?: number
  [key: string]: unknown
}

export const REQUIRED_HEADERS: (keyof MessageHeaders)[] = ['x-message-id']

export function assertMessageHeaders(headers: Record<string, unknown> | undefined): asserts headers is MessageHeaders {
  if (headers === undefined) {
    throw new Error(`Missing required headers: ${REQUIRED_HEADERS.join(', ')}`)
  }
  for (const key of REQUIRED_HEADERS) {
    if (headers[key] === undefined) {
      throw new Error(`Missing required header: ${key}`)
    }
  }
}
