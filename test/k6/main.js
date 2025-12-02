import { options } from './config.js'
import { cleanupTasksApi, runReadOnlyTasksApi, runWriteOnlyTasksApi } from './tasks.js'

export { options }

export function setup() {
  console.log('Start', new Date().toUTCString())
  cleanupTasksApi()
}

export function tasksReadOnlyScenario() {
  runReadOnlyTasksApi()
}

export function tasksWriteOnlyScenario() {
  runWriteOnlyTasksApi()
}

export function teardown() {
  cleanupTasksApi()
  console.log('End', new Date().toUTCString())
}
