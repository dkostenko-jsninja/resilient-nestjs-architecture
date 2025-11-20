export interface StateMetricService<Attributes extends Record<string, string> = Record<string, string>> {
  set: (value: number, attributes?: Attributes) => void
}
