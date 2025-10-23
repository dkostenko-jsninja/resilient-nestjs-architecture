import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { CACHE_SERVICE } from 'src/common/application/cache.service'
import { RedisCacheService } from 'src/common/infrastructure/cache/redis/cache.service'
import { withCircuitBreaker } from 'src/common/infrastructure/circuit-breaker/circuit-breaker.provider'
import { CircuitBreakerService } from 'src/common/infrastructure/circuit-breaker/circuit-breaker.service'
import { RedisConfigModule } from 'src/configs/redis/config.module'
import { IdempotencyInterceptor } from './interface/api/http/idempotency.interceptor'

@Module({
  imports: [RedisConfigModule],
  providers: [
    RedisCacheService,
    // InMemoryCacheService, // Uncomment if you want to use In-Memory cache
    {
      provide: CACHE_SERVICE,
      useFactory: (breaker: CircuitBreakerService, cache: RedisCacheService) => withCircuitBreaker(breaker, cache),
      inject: [
        CircuitBreakerService,
        RedisCacheService,
        // InMemoryCacheService, // Uncomment if you want to use In-Memory cache
      ],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class IdempotencyModule {}
