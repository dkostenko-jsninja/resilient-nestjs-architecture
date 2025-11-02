import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configFactory } from './config.factory'
import { RedisConfigService } from './config.service'

@Module({
  imports: [ConfigModule.forFeature(configFactory)],
  providers: [RedisConfigService],
  exports: [RedisConfigService],
})
export class RedisConfigModule {}
