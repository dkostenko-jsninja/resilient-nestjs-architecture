import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configFactory } from './config.factory'
import { MongoConfigService } from './config.service'

@Module({
  imports: [ConfigModule.forFeature(configFactory)],
  providers: [MongoConfigService],
  exports: [MongoConfigService],
})
export class MongoConfigModule {}
