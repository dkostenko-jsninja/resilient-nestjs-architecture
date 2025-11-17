import { Logger } from '@nestjs/common'
import { Meter, metrics } from '@opentelemetry/api'
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK, NodeSDKConfiguration } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { configFactory } from 'src/configs/telemetry/config.factory'

const {
  serviceApiName,
  serviceWorkerName,
  traceExporterUrl,
  prometheusExporterApiPort,
  prometheusExporterWorkerPort,
  prometheusExporterEndpoint,
} = configFactory()

let meter: Meter

async function initTelemetry(serviceName: string, metricsPort: number, instrumentationsConfigMap: InstrumentationConfigMap) {
  const logger = new Logger(`Telemetry ${serviceName}`)

  const configuration: Partial<NodeSDKConfiguration> = {
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
    metricReaders: [new PrometheusExporter({ port: metricsPort, endpoint: prometheusExporterEndpoint })],
    traceExporter: new OTLPTraceExporter({ url: traceExporterUrl }),
    instrumentations: [getNodeAutoInstrumentations(instrumentationsConfigMap)],
  }

  const sdk = new NodeSDK(configuration)

  try {
    await sdk.start()
    logger.log('Initialized')
  } catch (err) {
    logger.error('Initialization failed', err)
    return
  }

  meter = metrics.getMeter(serviceName)

  async function shutdown() {
    await sdk.shutdown()
    logger.log('Shutdown complete')
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
  process.on('SIGHUP', shutdown)
}

export { meter }

export async function initMainTelemetry() {
  await initTelemetry(serviceApiName, prometheusExporterApiPort, {
    '@opentelemetry/instrumentation-amqplib': { enabled: true },
    '@opentelemetry/instrumentation-express': { enabled: true },
    '@opentelemetry/instrumentation-http': { enabled: true },
    '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
    '@opentelemetry/instrumentation-ioredis': { enabled: true },
    '@opentelemetry/instrumentation-redis': { enabled: true },
    '@opentelemetry/instrumentation-pg': { enabled: true },
    '@opentelemetry/instrumentation-mongodb': { enabled: true },
    '@opentelemetry/instrumentation-mongoose': { enabled: true },
  })
}

export async function initWorkerTelemetry() {
  await initTelemetry(serviceWorkerName, prometheusExporterWorkerPort, {
    '@opentelemetry/instrumentation-amqplib': { enabled: true },
    '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
    '@opentelemetry/instrumentation-ioredis': { enabled: true },
    '@opentelemetry/instrumentation-redis': { enabled: true },
    '@opentelemetry/instrumentation-pg': { enabled: true },
    '@opentelemetry/instrumentation-mongodb': { enabled: true },
    '@opentelemetry/instrumentation-mongoose': { enabled: true },
  })
}
