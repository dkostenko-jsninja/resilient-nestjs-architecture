import { Logger } from '@nestjs/common'
import { Attributes, Counter } from '@opentelemetry/api'
import { CounterMetricService } from 'src/common/application/metrics/counter-metric.service'
import { meter } from '../telemetry'
import { MetricAttributes, MetricDefinition } from '../telemetry.constants'

export class OTelCounterMetricService<T extends MetricDefinition> implements CounterMetricService {
  private readonly logger = new Logger(OTelCounterMetricService.name)
  private readonly counter: Counter | undefined

  constructor(
    { name, description }: T,
    private readonly defaultAttributes?: MetricAttributes<T>,
  ) {
    if (meter) {
      this.counter = meter.createCounter(name, { description })
    } else {
      this.logger.warn('OTel meter is undefined. Skipping metrics...')
    }
  }

  add(value: number, attributes?: Attributes): void {
    if (value < 0) {
      throw new Error('Value must not be negative')
    }
    if (this.counter) {
      this.counter.add(value, { ...this.defaultAttributes, ...attributes })
    }
  }
}
