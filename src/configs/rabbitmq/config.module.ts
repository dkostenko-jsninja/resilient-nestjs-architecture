import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Global, Module } from '@nestjs/common'
import configuration from './configuration'

@Global()
@Module({
  imports: [RabbitMQModule.forRoot(configuration)],
  exports: [RabbitMQModule],
})
export class RabbitMqConfigModule {}
