import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MONGO_CONFIG_KEY, MongoConfig } from './config.factory'

@Injectable()
export class MongoConfigService {
  constructor(private readonly configService: ConfigService) {}

  get url(): string {
    return this.configService.getOrThrow<MongoConfig>(MONGO_CONFIG_KEY).url
  }
}
