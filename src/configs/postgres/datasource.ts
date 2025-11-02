import 'dotenv/config'
import Joi from 'joi'
import { join } from 'path'
import { DataSource } from 'typeorm'
import { getValidatedConfig } from '../validation'

export default new DataSource({
  type: 'postgres',
  url: getValidatedConfig('POSTGRES_CONFIG_KEY', process.env.POSTGRES_URL ?? '', Joi.string().uri().required()),
  entities: [join(__dirname, '../../', '**/modules/**/infrastructure/db/postgres/*.entity.{js,ts}')],
  migrations: [join(__dirname, 'migrations/*.{js,ts}')],
  synchronize: false,
})
