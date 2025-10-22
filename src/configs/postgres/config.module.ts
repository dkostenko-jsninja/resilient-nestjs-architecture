import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configFactory } from './config.factory'
import { PostgresConfigService } from './config.service'
import { POSTGRES_DATA_SOURCE } from './constants'

@Module({
  imports: [ConfigModule.forFeature(configFactory)],
  providers: [
    PostgresConfigService,
    {
      provide: POSTGRES_DATA_SOURCE,
      useFactory: async (configService: PostgresConfigService) => configService.connection,
      inject: [PostgresConfigService],
    },
  ],
  exports: [POSTGRES_DATA_SOURCE],
})
export class PostgresConfigModule {}
