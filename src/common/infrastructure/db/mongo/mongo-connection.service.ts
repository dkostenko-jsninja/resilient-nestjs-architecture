import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import mongoose, { Connection } from 'mongoose'
import { MongoConfigService } from 'src/configs/mongo/config.service'

@Injectable()
export class MongoConnectionService implements OnApplicationShutdown {
  private readonly logger = new Logger(MongoConnectionService.name)
  private connectionPromise: Promise<Connection> | null = null

  constructor(private readonly configService: MongoConfigService) {}

  async getConnection(): Promise<Connection> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = mongoose
      .createConnection(this.configService.url)
      .asPromise()
      .catch((error) => {
        this.connectionPromise = null
        this.logger.error('Failed to initialize Mongo connection', error)
        throw error
      })

    return this.connectionPromise
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.connectionPromise) {
      return
    }

    try {
      const connection = await this.connectionPromise
      await connection.close()
    } catch (error) {
      this.logger.error('Failed to close Mongo connection', error)
    } finally {
      this.connectionPromise = null
    }
  }
}
