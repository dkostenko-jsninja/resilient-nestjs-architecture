import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import mongoose, { Connection } from 'mongoose'
import { MONGO_CONFIG_KEY, MongoConfig } from './config.factory'

@Injectable()
export class MongoConfigService implements OnApplicationShutdown {
  private connectionPromise: Promise<Connection> | null = null

  constructor(private readonly configService: ConfigService) {}

  get connection(): Promise<Connection> {
    if (!this.connectionPromise) {
      const { url } = this.configService.getOrThrow<MongoConfig>(MONGO_CONFIG_KEY)
      this.connectionPromise = mongoose.createConnection(url).asPromise()
    }
    return this.connectionPromise
  }

  async onApplicationShutdown() {
    if (!this.connectionPromise) {
      return
    }
    const connection = await this.connectionPromise
    await connection.close()
  }
}
