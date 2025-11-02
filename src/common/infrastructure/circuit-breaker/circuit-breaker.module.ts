import { DynamicModule, Module } from '@nestjs/common'
import { CIRCUIT_BREAKER_NAME, CircuitBreakerService } from './circuit-breaker.service'

@Module({})
export class CircuitBreakerModule {
  static forFeature(name: string): DynamicModule {
    return {
      module: CircuitBreakerModule,
      providers: [CircuitBreakerService, { provide: CIRCUIT_BREAKER_NAME, useValue: name }],
      exports: [CircuitBreakerService],
    }
  }
}
