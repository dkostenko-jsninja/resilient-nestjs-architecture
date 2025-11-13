import { registerAs } from '@nestjs/config'
import 'dotenv/config'
import Joi from 'joi'
import { getValidatedConfig } from '../validation'

export const TELEMETRY_CONFIG_KEY = 'TELEMETRY_CONFIG_KEY'

export interface TelemetryConfig {
  serviceApiName: string
  serviceWorkerName: string
  traceExporterUrl: string
  prometheusExporterApiPort: number
  prometheusExporterWorkerPort: number
  prometheusExporterEndpoint: string
}

export const configFactory = registerAs(TELEMETRY_CONFIG_KEY, () => {
  const configuration: Record<keyof TelemetryConfig, string | boolean | undefined> = {
    serviceApiName: process.env.OTEL_SERVICE_API_NAME,
    serviceWorkerName: process.env.OTEL_SERVICE_WORKER_NAME,
    traceExporterUrl: process.env.OTEL_OTLP_EXPORTER_URL,
    prometheusExporterApiPort: process.env.OTEL_PROMETHEUS_EXPORTER_API_PORT,
    prometheusExporterWorkerPort: process.env.OTEL_PROMETHEUS_EXPORTER_WORKER_PORT,
    prometheusExporterEndpoint: process.env.OTEL_PROMETHEUS_EXPORTER_ENDPOINT,
  }

  const validationSchema = Joi.object({
    enabled: Joi.boolean().default(true),
    serviceApiName: Joi.string().default('API'),
    serviceWorkerName: Joi.string().default('WORKER'),
    traceExporterUrl: Joi.string().required(),
    prometheusExporterApiPort: Joi.number().required(),
    prometheusExporterWorkerPort: Joi.number().required(),
    prometheusExporterEndpoint: Joi.string().default('/metrics'),
  })

  return getValidatedConfig<TelemetryConfig>(TELEMETRY_CONFIG_KEY, configuration, validationSchema)
})
