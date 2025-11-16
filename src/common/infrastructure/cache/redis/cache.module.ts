import { Global, Module } from '@nestjs/common'
import { CACHE_SERVICE, CacheService } from 'src/common/application/cache.service'
import { RedisConfigModule } from 'src/configs/redis/config.module'
import { CircuitBreakerModule } from '../../circuit-breaker/circuit-breaker.module'
import { withCircuitBreaker } from '../../circuit-breaker/circuit-breaker.provider'
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service'
import { RedisCacheService } from './cache.service'

@Global()
@Module({
  imports: [RedisConfigModule, CircuitBreakerModule.forFeature('redis')],
  providers: [
    RedisCacheService,
    {
      provide: CACHE_SERVICE,
      useFactory: (breaker: CircuitBreakerService, cache: CacheService) => withCircuitBreaker(breaker, cache),
      inject: [CircuitBreakerService, RedisCacheService],
    },
  ],
  exports: [CACHE_SERVICE],
})
export class RedisCacheModule {}
