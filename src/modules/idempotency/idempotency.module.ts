import { DynamicModule, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { RedisCacheService } from 'src/common/infrastructure/cache/redis/cache.service'
import { CACHE_SERVICE } from 'src/common/service/cache.service'
import { RedisConfigModule } from 'src/configs/redis/config.module'
import { IdempotencyInterceptor } from './api/http/idempotency.interceptor'

@Module({})
export class IdempotencyModule {
  static forRoot(): DynamicModule {
    return {
      module: IdempotencyModule,
      imports: [RedisConfigModule],
      providers: [
        {
          provide: CACHE_SERVICE,
          useClass: RedisCacheService,
          // useClass: InMemoryCacheService, // Uncomment if you want to use In-Memory cache
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: IdempotencyInterceptor,
        },
      ],
    }
  }
}
