export const CIRCUIT_BREAKER_METRIC = {
  NAME: 'circuit_breaker_state',
  DESCRIPTION: 'Circuit breaker state (Closed, Half-Open, Open)',
  ATTRIBUTES: { DEPENDENCY: 'dependency' },
  STATES: {
    CLOSED: 0,
    HALF_OPEN: 1,
    OPEN: 2,
  },
}
