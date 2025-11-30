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
    tasksFull: {
      executor: 'constant-vus',
      vus: Math.floor(__ENV.VIRTUAL_USER_COUNT / 2),
      duration: __ENV.TEST_DURATION,
      exec: 'tasksFullScenario',
      tags: { scenario: 'tasks-full' },
    },
    tasksReadOnly: {
      executor: 'constant-vus',
      vus: Math.floor(__ENV.VIRTUAL_USER_COUNT / 2),
      duration: __ENV.TEST_DURATION,
      exec: 'tasksReadOnlyScenario',
      tags: { scenario: 'tasks-readonly' },
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200'],
    http_queued_req_failed: ['rate<0.01'],
    http_queued_req_duration: ['p(95)<5000', 'p(99)<60000'],
  },
}
