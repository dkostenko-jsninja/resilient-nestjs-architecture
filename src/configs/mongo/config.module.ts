import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configFactory } from './config.factory'
import { MongoConfigService } from './config.service'
import { MONGO_CONNECTION } from './constants'

@Module({
  imports: [ConfigModule.forFeature(configFactory)],
  providers: [
    MongoConfigService,
    {
      provide: MONGO_CONNECTION,
      useFactory: async (configService: MongoConfigService) => configService.connection,
      inject: [MongoConfigService],
    },
  ],
  exports: [MONGO_CONNECTION],
})
export class MongoConfigModule {}
