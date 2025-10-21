import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MONGO_CONFIG_KEY, MongoConfig } from './config.factory'

@Injectable()
export class MongoConfigService implements MongoConfig {
  constructor(private configService: ConfigService) {}

  get url() {
    return this.configService.getOrThrow<MongoConfig>(MONGO_CONFIG_KEY).url
  }
}
