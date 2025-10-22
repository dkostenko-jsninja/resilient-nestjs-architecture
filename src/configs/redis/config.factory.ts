import { registerAs } from '@nestjs/config'
import Joi from 'joi'
import { getValidatedConfig } from '../validation'

export const REDIS_CONFIG_KEY = 'REDIS_CONFIG'

export interface RedisConfig {
  url: string
}

export const configFactory = registerAs(REDIS_CONFIG_KEY, () => {
  const configuration: RedisConfig = {
    url: process.env.REDIS_URL ?? '',
  }

  const validationSchema = Joi.object({
    url: Joi.string().uri().required(),
  })

  return getValidatedConfig(REDIS_CONFIG_KEY, configuration, validationSchema)
})
