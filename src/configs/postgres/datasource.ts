import 'dotenv/config'
import { join } from 'path'
import { DataSource } from 'typeorm'
import { configFactory } from './config.factory'

const { url } = configFactory()

export default new DataSource({
  type: 'postgres',
  url,
  entities: [join(__dirname, '../../', '**/modules/**/infrastructure/db/postgres/*.entity.{js,ts}')],
  migrations: [join(__dirname, 'migrations/*.{js,ts}')],
  synchronize: false,
})
