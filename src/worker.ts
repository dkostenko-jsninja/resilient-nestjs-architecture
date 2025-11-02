import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './worker.module'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger(WorkerModule.name)
  await NestFactory.createApplicationContext(WorkerModule)
  logger.log('Running')
}

bootstrap()
