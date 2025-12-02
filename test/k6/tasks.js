import { sleep } from 'k6'
import { jitter, request, safeJson } from './client.js'
import { config } from './config.js'

function parseResponse(response) {
  const parsed = safeJson(response)
  return parsed?.result || parsed
}

function getTasks() {
  const response = request('GET', '/tasks', { tags: { name: 'list' }, name: 'list' })
  const tasks = parseResponse(response)
  if (Array.isArray(tasks)) {
    return tasks
  }
  throw new Error('GET /tasks returned invalid payload')
}

function getTask(id) {
  const response = request('GET', `/tasks/${id}`, { tags: { name: 'get' }, name: 'get' })
  const task = parseResponse(response)
  if (task?.id) {
    return task.id
  }
  throw new Error(`Get task failed. Status ${response.status}. ID: ${id}`)
}

function createTask(name) {
  const payload = JSON.stringify({ name })
  const response = request('POST', '/tasks', { body: payload, tags: { name: 'create' }, name: 'create' })
  const task = parseResponse(response)
  if (task?.id) {
    return task.id
  }
  throw new Error(`Create task failed. Status ${response.status}. Name: ${name}`)
}

function updateTask(id, name) {
  const payload = JSON.stringify({ name })
  const response = request('PUT', `/tasks/${id}`, { body: payload, tags: { name: 'update' }, name: 'update' })
  const task = parseResponse(response)
  if (task?.id) {
    return task.id
  }
  throw new Error(`Update task failed. Status ${response.status}. ID: ${id}`)
}

function deleteTasks() {
  const { status } = request('DELETE', `/tasks`, { tags: { name: 'delete' }, name: 'delete' })
  return status === 204
}

function deleteTask(id) {
  const response = request('DELETE', `/tasks/${id}`, { tags: { name: 'delete' }, name: 'delete' })
  const ok = response.status === 204 || safeJson(response).status === 'completed'
  if (!ok) {
    throw new Error(`Delete task failed. Status: ${response.status}. ID: ${id}`)
  }
  return ok
}

const ids = []

export function runReadOnlyTasksApi() {
  const roll = Math.random()

  const thresholds = {
    createOne: 0.5, // 50%
    getOne: 1, // 50%
    // GET /tasks is intentionally excluded because it returns the full unscoped dataset, shared across all VUs,
    // which would heavily bias the workload toward large read operations.
  }

  const idx = Math.floor(Math.random() * ids.length)
  const id = ids[idx] || ids[0]

  if (!id) {
    sleep(jitter())
  }

  if (!id || (roll <= thresholds.createOne && ids.length <= config.tasks.entitiesLimit)) {
    const id = createTask(`Task ${Date.now()}`)
    ids.push(id)
  } else if (roll <= thresholds.getOne) {
    getTask(id)
  }

  sleep(jitter())
}

export function runWriteOnlyTasksApi() {
  const roll = Math.random()

  const thresholds = {
    createOne: 0.35, // 35%
    updateOne: 0.7, // 35%
    deleteOne: 1, // 30%
  }

  const idx = Math.floor(Math.random() * ids.length)
  const id = ids[idx] || ids[0]

  if (!id) {
    sleep(jitter())
  }

  if (!id || (roll <= thresholds.createOne && ids.length <= config.tasks.entitiesLimit)) {
    const id = createTask(`Task ${Date.now()}`)
    ids.push(id)
  } else if (roll <= thresholds.updateOne) {
    updateTask(id, `Updated ${id}`)
  } else if (roll <= thresholds.deleteOne) {
    deleteTask(id)
    ids.splice(idx, 1)
  }

  sleep(0.1)
}

export function cleanupTasksApi() {
  deleteTasks()
}
