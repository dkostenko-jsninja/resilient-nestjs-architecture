import { Logger } from '@nestjs/common'
import { Attributes, Gauge } from '@opentelemetry/api'
import { StateMetricService } from 'src/common/application/metrics/state-metric.service'
import { meter } from '../telemetry'
import { MetricAttributes, MetricDefinition } from '../telemetry.constants'

export class OTelStateMetricService<T extends MetricDefinition> implements StateMetricService {
  private readonly logger = new Logger(OTelStateMetricService.name)
  private readonly gauge: Gauge | undefined

  constructor(
    { name, description }: T,
    private readonly defaultAttributes?: MetricAttributes<T>,
  ) {
    if (meter) {
      this.gauge = meter.createGauge(name, { description })
    } else {
      this.logger.warn('OTel meter is undefined. Skipping metrics...')
    }
  }

  set(value: number, attributes?: Attributes): void {
    if (this.gauge) {
      this.gauge.record(value, { ...this.defaultAttributes, ...attributes })
    }
  }
}
