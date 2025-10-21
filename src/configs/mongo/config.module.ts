import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongoConfigService } from './config.service'
import { configFactory } from './config.factory'
import { MongoConnectionProvider } from './connection.provider'
import { MONGO_CONNECTION } from './constants'

@Module({
  imports: [ConfigModule.forFeature(configFactory)],
  providers: [
    MongoConfigService,
    MongoConnectionProvider,
    {
      provide: MONGO_CONNECTION,
      useFactory: async (connectionProvider: MongoConnectionProvider) => connectionProvider.connection,
      inject: [MongoConnectionProvider],
    },
  ],
  exports: [MONGO_CONNECTION],
})
export class MongoConfigModule {}
