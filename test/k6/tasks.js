import { sleep } from 'k6'
import { request, jitter, safeJson } from './client.js'
import { config, options } from './config.js'

const tags = options.scenarios.tasksFull.tags

function parseResponse(response) {
  const parsed = safeJson(response)
  return parsed?.result || parsed
}

function getTasks() {
  const response = request('GET', '/tasks', { tags: { ...tags, name: 'list' }, name: 'list' })
  const tasks = parseResponse(response)
  if (Array.isArray(tasks)) {
    return tasks
  }
  throw new Error('GET /tasks returned invalid payload')
}

function getTask(id) {
  const response = request('GET', `/tasks/${id}`, { tags: { ...tags, name: 'get' }, name: 'get' })
  const task = parseResponse(response)
  if (task?.id) {
    return task.id
  }
  throw new Error(`Get task failed. Status ${response.status}. ID: ${id}`)
}

function createTask(name) {
  const payload = JSON.stringify({ name })
  const response = request('POST', '/tasks', { body: payload, tags: { ...tags, name: 'create' }, name: 'create' })
  const task = parseResponse(response)
  if (task?.id) {
    return task.id
  }
  throw new Error(`Create task failed. Status ${response.status}. Name: ${name}`)
}

function updateTask(id, name) {
  const payload = JSON.stringify({ name })
  const response = request('PUT', `/tasks/${id}`, { body: payload, tags: { ...tags, name: 'update' }, name: 'update' })
  const task = parseResponse(response)
  if (task?.id) {
    return task.id
  }
  throw new Error(`Update task failed. Status ${response.status}. ID: ${id}`)
}

function deleteTasks() {
  const { status } = request('DELETE', `/tasks`, { tags: { ...tags, name: 'delete' }, name: 'delete' })
  return status === 204
}

function deleteTask(id) {
  const response = request('DELETE', `/tasks/${id}`, { tags: { ...tags, name: 'delete' }, name: 'delete' })
  const ok = response.status === 204 || safeJson(response).status === 'completed'
  if (!ok) {
    throw new Error(`Delete task failed. Status: ${response.status}. ID: ${id}`)
  }
  return ok
}

const ids = []

export function runFullTasksApi() {
  const roll = Math.random()

  const thresholds = {
    createOne: 0.35, // 35%
    updateOne: 0.50, // 15%
    deleteOne: 0.75, // 25%
    getOne: 1, // 25%
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
  } else if (roll <= thresholds.updateOne) {
    updateTask(id, `Updated ${id}`)
  } else if (roll <= thresholds.deleteOne) {
    deleteTask(id)
    ids.splice(idx, 1)
  } else if (roll <= thresholds.getOne) {
    getTask(id)
  }

  sleep(0.1)
}

export function runReadOnlyTasksApi() {
  if (ids.length <= config.tasks.entitiesLimit) {
    sleep(jitter())
    const id = createTask(`Task ${Date.now()}`)
    ids.push(id)
  } else {
    const idx = Math.floor(Math.random() * ids.length)
    const id = ids[idx] || ids[0]
    getTask(id)
  }

  sleep(0.1)
}

export function cleanupTasksApi() {
  deleteTasks()
}
