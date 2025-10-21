import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import mongoose, { Connection } from 'mongoose'
import { MongoConfigService } from './config.service'

@Injectable()
export class MongoConnectionProvider implements OnApplicationShutdown {
  private connectionPromise?: Promise<Connection>

  constructor(private readonly configService: MongoConfigService) {}

  get connection(): Promise<Connection> {
    if (!this.connectionPromise) {
      this.connectionPromise = mongoose.createConnection(this.configService.url).asPromise()
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
