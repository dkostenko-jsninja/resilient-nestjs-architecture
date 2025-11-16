import { Global, Module } from '@nestjs/common'
import { MongoConfigModule } from 'src/configs/mongo/config.module'
import { CircuitBreakerModule } from '../../circuit-breaker/circuit-breaker.module'
import { MongoConnectionService } from './mongo-connection.service'

export const MONGO_CONNECTION = 'MONGO_CONNECTION'

@Global()
@Module({
  imports: [MongoConfigModule, CircuitBreakerModule.forFeature('mongodb')],
  providers: [
    MongoConnectionService,
    {
      provide: MONGO_CONNECTION,
      useFactory: async (service: MongoConnectionService) => await service.getConnection(),
      inject: [MongoConnectionService],
    },
  ],
  exports: [MONGO_CONNECTION, CircuitBreakerModule],
})
export class MongoModule {}
