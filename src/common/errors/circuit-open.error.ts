export class CircuitOpenError extends Error {
  constructor(
    message = 'Circuit open',
    public readonly retryAfter: number = 1,
    public readonly cause?: unknown,
  ) {
    super(message)
  }
}
