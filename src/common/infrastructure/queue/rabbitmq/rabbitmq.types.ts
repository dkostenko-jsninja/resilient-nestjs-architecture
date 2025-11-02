export type RabbitMqRoutingKeys = Record<string, string>

export interface RabbitMqFeatureConfig<Key extends string = string> {
  feature: string
  keys: Key[]
}
