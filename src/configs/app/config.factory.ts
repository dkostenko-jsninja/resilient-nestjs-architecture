import { registerAs } from '@nestjs/config'
import Joi from 'joi'
import { getValidatedConfig } from '../validation'

export const APP_CONFIG_KEY = 'APP_CONFIG'

export interface AppConfig {
  port: number
  env: 'development' | 'production'
}

export const configFactory = registerAs(APP_CONFIG_KEY, () => {
  const configuration: Record<keyof AppConfig, string | undefined> = {
    port: process.env.APP_PORT,
    env: process.env.NODE_ENV,
  }

  const validationSchema = Joi.object({
    port: Joi.number().default(8080),
    env: Joi.string().valid('development', 'production').default('development'),
  })

  return getValidatedConfig(APP_CONFIG_KEY, configuration, validationSchema)
})
