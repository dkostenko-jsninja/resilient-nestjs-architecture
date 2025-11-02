import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import datasource from 'src/configs/postgres/datasource'
import { DataSource } from 'typeorm'

@Injectable()
export class PostgresConnectionService implements OnApplicationShutdown {
  private readonly logger = new Logger(PostgresConnectionService.name)
  private initializationPromise: Promise<DataSource> | null = null

  async getConnection(): Promise<DataSource> {
    if (datasource.isInitialized) {
      return datasource
    }

    if (!this.initializationPromise) {
      this.initializationPromise = datasource.initialize().catch((error) => {
        this.initializationPromise = null
        this.logger.error('Failed to initialize Postgres connection', error)
        throw error
      })
    }

    return this.initializationPromise
  }

  async onApplicationShutdown(): Promise<void> {
    if (!datasource.isInitialized) {
      return
    }

    try {
      await datasource.destroy()
    } catch (error) {
      this.logger.error('Failed to close Postgres connection', error)
    } finally {
      this.initializationPromise = null
    }
  }
}
