import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppConfigService } from './config.service'
import { configFactory } from './config.factory'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configFactory],
      isGlobal: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
