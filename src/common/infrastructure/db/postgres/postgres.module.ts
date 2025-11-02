import { Global, Module } from '@nestjs/common'
import { PostgresConnectionService } from './postgres-connection.service'

export const POSTGRES_DATA_SOURCE = 'POSTGRES_DATA_SOURCE'

@Global()
@Module({
  providers: [
    PostgresConnectionService,
    {
      provide: POSTGRES_DATA_SOURCE,
      useFactory: async (service: PostgresConnectionService) =>  service.getConnection(),
      inject: [PostgresConnectionService],
    },
  ],
  exports: [POSTGRES_DATA_SOURCE],
})
export class PostgresModule {}
