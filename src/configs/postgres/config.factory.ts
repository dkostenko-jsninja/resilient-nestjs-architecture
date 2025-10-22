import { registerAs } from '@nestjs/config'
import Joi from 'joi'
import { getValidatedConfig } from '../validation'

export const POSTGRES_CONFIG_KEY = 'POSTGRES_CONFIG'

export interface PostgresConfig {
  url: string
}

export const configFactory = registerAs(POSTGRES_CONFIG_KEY, () => {
  const configuration: PostgresConfig = {
    url: process.env.POSTGRES_URL ?? '',
  }

  const validationSchema = Joi.object({
    url: Joi.string().uri().required(),
  })

  return getValidatedConfig(POSTGRES_CONFIG_KEY, configuration, validationSchema)
})
