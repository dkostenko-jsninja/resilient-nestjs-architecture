import { Global, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { IdempotencyInterceptor } from './interface/api/http/idempotency.interceptor'

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class IdempotencyModule {}
