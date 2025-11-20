import { CounterMetricService } from '../metrics/counter-metric.service'

export class CacheMetricService<Scenario extends string = string, Attributes extends Record<string, string> = Record<string, string>> {
  constructor(
    private readonly cacheHits: CounterMetricService<Attributes>,
    private readonly cacheMisses: CounterMetricService<Attributes>,
    private readonly scenarioAttributes: Record<Scenario, Attributes>,
  ) {}

  hit(scenario: Scenario): void {
    this.cacheHits.add(1, this.scenarioAttributes[scenario])
  }

  miss(scenario: Scenario): void {
    this.cacheMisses.add(1, this.scenarioAttributes[scenario])
  }
}
