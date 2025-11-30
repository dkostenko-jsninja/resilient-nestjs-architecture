import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import CircuitBreaker from 'opossum'
import { StateMetricService } from 'src/common/application/metrics/state-metric.service'
import { TransientInfrastructureError } from 'src/common/errors/transient-infrastructure.error'

@Injectable()
export class CircuitBreakerService implements OnModuleDestroy {
  private readonly logger: Logger
  private readonly breaker: CircuitBreaker<[() => Promise<unknown>], unknown>
  private readonly breakerOptions: CircuitBreaker.Options<[operation: () => Promise<unknown>]>

  private readonly state = {
    closed: 0,
    halfOpen: 1,
    open: 2,
  }

  constructor(
    private readonly name: string,
    breakerOptionOverrides: CircuitBreaker.Options<[operation: () => Promise<unknown>]>,
    private readonly stateMetric: StateMetricService,
  ) {
    this.breakerOptions = {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 30000,
      rollingCountBuckets: 10,
      volumeThreshold: 10,
      allowWarmUp: true,
      ...breakerOptionOverrides,
    }
    this.stateMetric.set(this.state.closed)
    this.logger = new Logger(`${this.name} Circuit`)
    this.breaker = new CircuitBreaker((operation) => operation(), this.breakerOptions)
    this.breaker.on('open', () => {
      this.logger.warn('OPEN')
      this.stateMetric.set(this.state.open)
    })
    this.breaker.on('halfOpen', () => {
      this.logger.log('HALF-OPEN')
      this.stateMetric.set(this.state.halfOpen)
    })
    this.breaker.on('close', () => {
      this.logger.log('CLOSED')
      this.stateMetric.set(this.state.closed)
    })
    this.breaker.on('timeout', () => this.logger.warn('Operation timed out'))
    this.breaker.on('reject', () => this.logger.warn('Operation rejected (breaker open)'))
    this.breaker.on('failure', (err: Error) => this.logger.warn(`Operation failure: ${err.message}`))
  }

  async fire<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await this.breaker.fire(operation)
      return result as T
    } catch (error) {
      // For the sake of simplicity, we assume that all application and infrastructure logic works correctly,
      // and any thrown error represents a distributed system failure (e.g., DB, cache, etc).
      // Ideally, these errors should be properly classified.
      throw new TransientInfrastructureError('Dependency unavailable', this.breakerOptions.resetTimeout, error)
    }
  }

  onModuleDestroy() {
    this.breaker.shutdown()
  }
}
