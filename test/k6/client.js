import { check, randomSeed, sleep } from 'k6'
import http from 'k6/http'
import { config, metrics } from './config.js'

randomSeed(123456)

const RETRYABLE_STATUS_CODES = new Set([0, 500, 502, 503, 504])

export function jitter() {
  return Math.random() * 0.1
}

function ok(response, name = 'http') {
  return check(response, { [`${name}:2xx/3xx`]: ({ status }) => status >= 200 && status < 400 })
}

export function safeJson(response) {
  try {
    return response.json()
  } catch {
    return null
  }
}

export function request(method, path, { body = null, tags = {}, name = method } = {}) {
  const url = `${config.baseUrl}${path}`
  const params = { headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': crypto.randomUUID() }, tags }

  let response = null
  let attempt = 0

  while (true) {
    response = http.request(method, url, body, params)

    if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < config.maxRetries) {
      const retryAfter = config.retryAfter // or response.headers['Retry-After'] if you want a realistic retry simulation
      sleep(retryAfter + jitter())
      attempt++
      continue
    }

    if (response.status === 202) {
      const retryAfter = config.retryAfter // or safeJson(response).retryAfter if you want a realistic retry simulation
      response = pollQueuedTask(response.headers.Location, retryAfter, tags)
    }

    break
  }

  ok(response, name)
  return response
}

function pollQueuedTask(path, retryAfter, tags) {
  sleep(retryAfter + jitter())

  metrics.queuedRequests.add(1)
  metrics.queuedRequestsFailed.add(0)

  const start = Date.now()
  while (true) {
    const response = request('GET', path, { tags: { ...tags, op: 'get' }, name: 'get:queued' })

    const data = safeJson(response)
    if (data?.status === 'pending' || data?.status === 'in_progress') {
      sleep(retryAfter + jitter())
      continue
    }

    if (data?.status === 'failed') {
      metrics.queuedRequestsFailed.add(1)
    }

    metrics.queuedRequestsDurationMs.add(Date.now() - start)
    return response
  }
}
