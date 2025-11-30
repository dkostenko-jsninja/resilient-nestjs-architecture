import { options } from './config.js'
import { cleanupTasksApi, runFullTasksApi, runReadOnlyTasksApi } from './tasks.js'

export { options }

export function setup() {
  console.log('Start', new Date().toUTCString())
  cleanupTasksApi()
}

export function tasksFullScenario() {
  runFullTasksApi()
}

export function tasksReadOnlyScenario() {
  runReadOnlyTasksApi()
}

export function teardown() {
  cleanupTasksApi()
  console.log('End', new Date().toUTCString())
}
