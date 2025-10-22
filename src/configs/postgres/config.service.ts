import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { DataSource } from 'typeorm'
import datasource from './datasource'

@Injectable()
export class PostgresConfigService implements OnApplicationShutdown {
  private connectionPromise: Promise<DataSource> | null = null

  get connection(): Promise<DataSource> {
    if (!this.connectionPromise) {
      this.connectionPromise = datasource.initialize()
    }
    return this.connectionPromise
  }

  async onApplicationShutdown() {
    if (!this.connectionPromise) {
      return
    }
    const connection = await this.connectionPromise
    if (connection.isInitialized) {
      await connection.destroy()
    }
  }
}
