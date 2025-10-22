import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configFactory } from './config.factory'
import { RedisConfigService } from './config.service'
import { REDIS_CLIENT } from './constants'

@Module({
  imports: [ConfigModule.forFeature(configFactory)],
  providers: [
    RedisConfigService,
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: RedisConfigService) => configService.client,
      inject: [RedisConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisConfigModule {}
