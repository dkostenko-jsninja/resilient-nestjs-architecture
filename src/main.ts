import { Logger, ValidationPipe } from '@nestjs/common'
import { initMainTelemetry } from './common/infrastructure/telemetry/telemetry'
import { AppConfigService } from './configs/app/config.service'

async function bootstrap() {
  await initMainTelemetry()

  const { NestFactory } = await import('@nestjs/core')
  const { AppModule } = await import('./app.module')

  const logger = new Logger(AppModule.name)
  const app = await NestFactory.create(AppModule)
  const appConfigService = app.get(AppConfigService)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  await app.listen(appConfigService.port)

  logger.log(`Listening to ${appConfigService.port}`)
}
bootstrap()
