import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq'
import 'dotenv/config'
import Joi from 'joi'
import { getValidatedConfig } from '../validation'

const configuration: RabbitMQConfig = {
  uri: getValidatedConfig('RABBITMQ_CONFIG_KEY', process.env.RABBITMQ_URI ?? '', Joi.string().uri().required()),
  connectionInitOptions: { wait: true, timeout: 3000 },
}

export default configuration
