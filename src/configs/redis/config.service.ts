import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REDIS_CONFIG_KEY, RedisConfig } from './config.factory'

@Injectable()
export class RedisConfigService {
  constructor(private readonly configService: ConfigService) {}

  get url(): string {
    return this.configService.getOrThrow<RedisConfig>(REDIS_CONFIG_KEY).url
  }
}
