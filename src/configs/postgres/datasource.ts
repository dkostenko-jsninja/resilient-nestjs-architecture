import 'dotenv/config'
import Joi from 'joi'
import { join } from 'path'
import { DataSource } from 'typeorm'
import { getValidatedConfig } from '../validation'

interface PostgresConfig {
  url: string
  maxConnections: number
}

const rawConfig: Record<keyof PostgresConfig, string | undefined> = {
  url: process.env.POSTGRES_URL,
  maxConnections: process.env.POSTGRES_MAX_CONNECTIONS,
}

const config = getValidatedConfig<PostgresConfig>(
  'POSTGRES_CONFIG',
  rawConfig,
  Joi.object({
    url: Joi.string().uri().required(),
    maxConnections: Joi.number().integer().min(1).default(10),
  }),
)

export default new DataSource({
  type: 'postgres',
  url: config.url,
  entities: [join(__dirname, '../../', '**/modules/**/infrastructure/db/postgres/*.entity.{js,ts}')],
  migrations: [join(__dirname, 'migrations/*.{js,ts}')],
  synchronize: false,
  extra: {
    max: config.maxConnections,
  },
})
