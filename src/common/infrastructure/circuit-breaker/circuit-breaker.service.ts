import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import CircuitBreaker from 'opossum'
import { CircuitOpenError } from 'src/common/errors/circuit-open.error'
import { TransientInfrastructureError } from 'src/common/errors/transient-infrastructure.error'

@Injectable()
export class CircuitBreakerService implements OnModuleDestroy {
  private readonly logger = new Logger(CircuitBreakerService.name)
  private readonly breaker: CircuitBreaker<[() => Promise<unknown>], unknown>
  private readonly breakerOptions: CircuitBreaker.Options<[operation: () => Promise<unknown>]> = {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
    rollingCountTimeout: 10000,
    rollingCountBuckets: 10,
    volumeThreshold: 5,
  }

  constructor() {
    this.breaker = new CircuitBreaker((operation) => operation(), this.breakerOptions)

    this.breaker.on('open', () => this.logger.warn('Circuit OPEN'))
    this.breaker.on('halfOpen', () => this.logger.log('Circuit HALF-OPEN'))
    this.breaker.on('close', () => this.logger.log('Circuit CLOSED'))
    this.breaker.on('timeout', () => this.logger.warn('Circuit operation timed out'))
    this.breaker.on('reject', () => this.logger.warn('Circuit operation rejected (breaker open)'))
    this.breaker.on('failure', (err: Error) => this.logger.warn(`Circuit operation failure: ${err.message}`))
  }

  async fire<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await this.breaker.fire(operation)
      return result as T
    } catch (error) {
      // For the sake of simplicity, we assume that all application and infrastructure logic works correctly,
      // and any thrown error represents a distributed system failure (e.g., DB, cache, etc).
      // Ideally, these errors should be properly classified.
      if (this.breaker.opened) {
        throw new CircuitOpenError('Circuit open. Try again later', this.breakerOptions.resetTimeout, error)
      } else {
        throw new TransientInfrastructureError('Dependency unavailable', this.breakerOptions.resetTimeout, error)
      }
    }
  }

  onModuleDestroy() {
    this.breaker.shutdown()
  }
}
