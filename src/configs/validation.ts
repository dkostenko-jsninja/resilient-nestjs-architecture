import Joi from 'joi'

export function getValidatedConfig<C>(key: string, config: any, validationSchema: Joi.AnySchema): C {
  const { error, value } = validationSchema.validate(config, { abortEarly: false })
  if (error) {
    throw new Error(`${key} configuration invalid: ${error.message}`)
  }
  return value
}
