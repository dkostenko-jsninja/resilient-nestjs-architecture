export interface Message<Key extends string = string, Payload = unknown> {
  key: Key
  payload: Payload
}
