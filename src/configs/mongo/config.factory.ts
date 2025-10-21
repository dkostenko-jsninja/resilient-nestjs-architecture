import { registerAs } from '@nestjs/config'
import Joi from 'joi'
import { getValidatedConfig } from '../validation'

export const MONGO_CONFIG_KEY = 'MONGO_CONFIG'

export interface MongoConfig {
  url: string
}

export const configFactory = registerAs(MONGO_CONFIG_KEY, () => {
  const configuration: MongoConfig = {
    url: process.env.MONGO_URL!,
  }

  const validationSchema = Joi.object({
    url: Joi.string().uri().required(),
  })

  return getValidatedConfig(MONGO_CONFIG_KEY, configuration, validationSchema)
})
