import { DynamicModule, Module } from '@nestjs/common'
import { OTelStateMetricService } from '../telemetry/metrics/state-metric.service'
import { CIRCUIT_BREAKER_METRIC } from '../telemetry/telemetry.constants'
import { CIRCUIT_BREAKER_NAME, CIRCUIT_BREAKER_STATE_METRIC_SERVICE, CircuitBreakerService } from './circuit-breaker.service'

@Module({})
export class CircuitBreakerModule {
  static forFeature(name: string): DynamicModule {
    return {
      module: CircuitBreakerModule,
      providers: [
        CircuitBreakerService,
        { provide: CIRCUIT_BREAKER_NAME, useValue: name },
        {
          provide: CIRCUIT_BREAKER_STATE_METRIC_SERVICE,
          useValue: new OTelStateMetricService(
            CIRCUIT_BREAKER_METRIC.NAME,
            { description: CIRCUIT_BREAKER_METRIC.DESCRIPTION },
            { [CIRCUIT_BREAKER_METRIC.ATTRIBUTES.DEPENDENCY]: name },
          ),
        },
      ],
      exports: [CircuitBreakerService],
    }
  }
}
