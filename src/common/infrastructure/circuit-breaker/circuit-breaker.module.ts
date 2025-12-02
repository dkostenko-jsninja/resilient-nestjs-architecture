import { DynamicModule, Module } from '@nestjs/common'
import CircuitBreaker from 'opossum'
import { OTelStateMetricService } from '../telemetry/metrics/state-metric.service'
import { METRIC_DEFINITIONS, MetricAttributes } from '../telemetry/telemetry.constants'
import { CircuitBreakerService } from './circuit-breaker.service'

@Module({})
export class CircuitBreakerModule {
  static forFeature(
    dependency: MetricAttributes<typeof METRIC_DEFINITIONS.CIRCUIT_BREAKER>['dependency'],
    breakerOptions: CircuitBreaker.Options<[operation: () => Promise<unknown>]> = {},
  ): DynamicModule {
    return {
      module: CircuitBreakerModule,
      providers: [
        {
          provide: CircuitBreakerService,
          useFactory: () => {
            const stateMetric = new OTelStateMetricService(METRIC_DEFINITIONS.CIRCUIT_BREAKER, { dependency })
            return new CircuitBreakerService(dependency, breakerOptions, stateMetric)
          },
        },
      ],
      exports: [CircuitBreakerService],
    }
  }
}
