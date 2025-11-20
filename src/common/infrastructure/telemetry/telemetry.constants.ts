import { AttributeValue } from '@opentelemetry/api'

type BaseMetricDefinition = {
  readonly name: string
  readonly description: string
  readonly attributes: Record<string, readonly AttributeValue[]>
}

export const METRIC_DEFINITIONS = {
  CIRCUIT_BREAKER: {
    name: 'circuit_breaker_state',
    description: 'Circuit breaker state (Closed=0, Half-Open=1, Open=2)',
    attributes: { dependency: ['mongodb', 'postgresql', 'redis', 'rabbitmq'] },
  },
  CACHE_HITS: {
    name: 'cache_hits_total',
    description: 'Cache hits total',
    attributes: { entity: ['task'], scope: ['all', 'single'] },
  },
  CACHE_MISSES: {
    name: 'cache_misses_total',
    description: 'Cache misses total',
    attributes: { entity: ['task'], scope: ['all', 'single'] },
  },
} as const satisfies Record<string, BaseMetricDefinition>

type MetricDefinitions = typeof METRIC_DEFINITIONS

export type MetricDefinition = {
  [K in keyof MetricDefinitions]: MetricDefinitions[K]
}[keyof MetricDefinitions]

export type MetricAttributes<T extends MetricDefinition> = {
  [K in keyof T['attributes']]: T['attributes'][K] extends readonly AttributeValue[] ? T['attributes'][K][number] : never
}

export type CommonMetricAttributes<A extends MetricDefinition, B extends MetricDefinition> = {
  [K in keyof A['attributes'] & keyof B['attributes']]: A['attributes'][K] extends readonly AttributeValue[]
    ? B['attributes'][K] extends readonly AttributeValue[]
      ? A['attributes'][K][number] & B['attributes'][K][number]
      : never
    : never
}
