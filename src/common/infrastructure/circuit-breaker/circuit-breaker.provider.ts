import { CircuitBreakerService } from './circuit-breaker.service'

export function withCircuitBreaker<T extends object>(breaker: CircuitBreakerService, repository: T): T {
  return new Proxy(repository, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (typeof value !== 'function') return value

      return (...args: unknown[]) => breaker.fire(() => value.apply(target, args))
    },
  })
}
