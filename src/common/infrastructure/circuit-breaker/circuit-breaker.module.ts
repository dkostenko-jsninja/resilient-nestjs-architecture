import { DynamicModule, Module } from '@nestjs/common'
import { OTelStateMetricService } from '../telemetry/metrics/state-metric.service'
import { METRIC_DEFINITIONS, MetricAttributes } from '../telemetry/telemetry.constants'
import { CIRCUIT_BREAKER_NAME, CIRCUIT_BREAKER_STATE_METRIC_SERVICE, CircuitBreakerService } from './circuit-breaker.service'

@Module({})
export class CircuitBreakerModule {
  static forFeature(dependency: MetricAttributes<typeof METRIC_DEFINITIONS.CIRCUIT_BREAKER>['dependency']): DynamicModule {
    return {
      module: CircuitBreakerModule,
      providers: [
        CircuitBreakerService,
        { provide: CIRCUIT_BREAKER_NAME, useValue: dependency },
        {
          provide: CIRCUIT_BREAKER_STATE_METRIC_SERVICE,
          useValue: new OTelStateMetricService(METRIC_DEFINITIONS.CIRCUIT_BREAKER, { dependency }),
        },
      ],
      exports: [CircuitBreakerService],
    }
  }
}
