import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_CONFIG_KEY, type AppConfig } from './config.factory'

@Injectable()
export class AppConfigService implements AppConfig {
  constructor(private configService: ConfigService) {}

  get port() {
    return this.configService.getOrThrow<AppConfig>(APP_CONFIG_KEY).port
  }

  get env() {
    return this.configService.getOrThrow<AppConfig>(APP_CONFIG_KEY).env
  }
}
