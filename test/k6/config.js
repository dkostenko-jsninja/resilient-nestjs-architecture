import { randomSeed } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

randomSeed(123456)

export const config = {
  baseUrl: __ENV.BASE_URL,
  maxRetries: 3,
  /**
   * Seconds
   */
  retryAfter: 3,
  tasks: {
    /**
     * Per VU
     */
    entitiesLimit: 25,
  },
}

export const metrics = {
  queuedRequests: new Counter('http_queued_reqs'),
  queuedRequestsFailed: new Rate('http_queued_req_failed'),
  queuedRequestsDurationMs: new Trend('http_queued_req_duration', true),
}

export const options = {
  scenarios: {
    read: {
      executor: 'constant-vus',
      vus: Math.floor(__ENV.VIRTUAL_USER_COUNT * 0.3),
      duration: __ENV.TEST_DURATION,
      exec: 'tasksReadOnlyScenario',
    },
    write: {
      executor: 'constant-vus',
      vus: Math.floor(__ENV.VIRTUAL_USER_COUNT * 0.7),
      duration: __ENV.TEST_DURATION,
      exec: 'tasksWriteOnlyScenario',
    },
  },
  thresholds: {
    'http_req_failed{scenario:read}': ['rate<0.01'],
    'http_req_failed{scenario:write}': ['rate<0.01'],
    'http_req_duration{scenario:read}': ['p(95)<200'],
    'http_req_duration{scenario:write}': ['p(95)<200'],
    http_queued_req_failed: ['rate<0.01'],
    http_queued_req_duration: ['p(95)<30000', 'p(99)<120000'],
  },
}
