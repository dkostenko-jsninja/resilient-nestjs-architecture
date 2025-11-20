export interface CounterMetricService<Attributes extends Record<string, string> = Record<string, string>> {
  add: (value: number, attributes?: Attributes) => void
}
