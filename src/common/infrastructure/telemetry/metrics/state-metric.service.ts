import { Attributes, Gauge, MetricOptions } from '@opentelemetry/api'
import { StateMetricService } from 'src/common/application/metrics/state-metric.service'
import { meter } from '../telemetry'
import { Logger } from '@nestjs/common'

export class OTelStateMetricService implements StateMetricService<number> {
  private readonly logger = new Logger(OTelStateMetricService.name)
  private readonly gauge: Gauge | undefined

  constructor(
    name: string,
    options: MetricOptions,
    private readonly attributes?: Attributes,
  ) {
    if (meter) {
      this.gauge = meter.createGauge(name, options)
    } else {
      this.logger.warn('OTel meter is undefined. Skipping metrics...')
    }
  }

  setState(value: number): void {
    if (this.gauge) {
      this.gauge.record(value, this.attributes)
    }
  }
}
