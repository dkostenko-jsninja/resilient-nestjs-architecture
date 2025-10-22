import { DynamicModule, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { InMemoryCacheService } from 'src/common/infrastructure/cache/in-memory/cache.service'
import { CACHE_SERVICE } from 'src/common/service/cache.service'
import { IdempotencyInterceptor } from './api/http/idempotency.interceptor'

@Module({})
export class IdempotencyModule {
  static forRoot(): DynamicModule {
    return {
      module: IdempotencyModule,
      providers: [
        {
          provide: CACHE_SERVICE,
          useClass: InMemoryCacheService,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: IdempotencyInterceptor,
        },
      ],
    }
  }
}
