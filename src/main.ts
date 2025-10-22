import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AppConfigService } from './configs/app/config.service'

async function bootstrap() {
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
  await app.listen(appConfigService.port!)
}
bootstrap()
