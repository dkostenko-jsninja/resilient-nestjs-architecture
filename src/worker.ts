import { Logger } from '@nestjs/common'
import { initWorkerTelemetry } from './common/infrastructure/telemetry/telemetry'

async function bootstrap() {
  await initWorkerTelemetry()

  const { NestFactory } = await import('@nestjs/core')
  const { WorkerModule } = await import('./worker.module')

  const logger = new Logger(WorkerModule.name)

  await NestFactory.createApplicationContext(WorkerModule)

  logger.log('Running')
}

bootstrap()
