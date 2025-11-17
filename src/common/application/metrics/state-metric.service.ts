export interface StateMetricService<Value = unknown> {
  setState: (value: Value) => void
}
