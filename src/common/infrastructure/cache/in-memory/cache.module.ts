import { Global, Module } from '@nestjs/common'
import { CACHE_SERVICE } from 'src/common/application/cache/cache.service'
import { InMemoryCacheService } from './cache.service'

@Global()
@Module({
  providers: [
    InMemoryCacheService,
    {
      provide: CACHE_SERVICE,
      useClass: InMemoryCacheService,
    },
  ],
  exports: [CACHE_SERVICE],
})
export class InMemoryCacheModule {}
