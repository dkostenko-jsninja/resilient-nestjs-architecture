export class TransientInfrastructureError extends Error {
  constructor(
    message = 'Transient infrastructure failure',
    public readonly retryAfter: number = 1,
    public readonly cause?: unknown,
  ) {
    super(message)
  }
}
