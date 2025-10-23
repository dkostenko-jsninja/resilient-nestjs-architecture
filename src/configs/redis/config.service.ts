import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'
import { REDIS_CONFIG_KEY, RedisConfig } from './config.factory'

@Injectable()
export class RedisConfigService implements OnApplicationShutdown {
  private _client: Redis | null = null

  constructor(private readonly configService: ConfigService) {}

  get client() {
    if (!this._client) {
      const { url } = this.configService.getOrThrow<RedisConfig>(REDIS_CONFIG_KEY)
      this._client = new Redis(url)
    }
    return this._client
  }

  async onApplicationShutdown() {
    if (this._client) {
      this._client?.quit()
    }
  }
}
