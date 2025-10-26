import { Global, Module } from '@nestjs/common'
import { CACHE_SERVICE, CacheService } from 'src/common/application/cache.service'
import { RedisConfigModule } from 'src/configs/redis/config.module'
import { withCircuitBreaker } from '../circuit-breaker/circuit-breaker.provider'
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service'
import { RedisCacheService } from './redis/cache.service'

@Global()
@Module({
  imports: [RedisConfigModule],
  providers: [
    RedisCacheService,
    // InMemoryCacheService, // Uncomment if you want to use In-Memory cache
    {
      provide: CACHE_SERVICE,
      useFactory: (breaker: CircuitBreakerService, cache: CacheService) => withCircuitBreaker(breaker, cache),
      inject: [
        CircuitBreakerService,
        RedisCacheService,
        // InMemoryCacheService, // Uncomment if you want to use In-Memory cache
      ],
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
