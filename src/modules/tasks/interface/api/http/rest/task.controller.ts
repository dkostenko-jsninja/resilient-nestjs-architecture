import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Res, UseFilters } from '@nestjs/common'
import type { Response } from 'express'
import { TransientInfrastructureError } from 'src/common/errors/transient-infrastructure.error'
import { ServiceUnavailableFilter } from 'src/common/interface/api/http/filters/service-unavailable.filter'
import { TaskService } from 'src/modules/tasks/application/task.service'
import { TaskMessageInput, TaskMessageState } from 'src/modules/tasks/interface/messaging/task-message'
import { TaskMessagePublisherService } from 'src/modules/tasks/interface/messaging/task-message-publisher.service'
import { TaskMessageStateService } from 'src/modules/tasks/interface/messaging/task-message-state.service'
import { CreateTaskDto, TaskIdParamDto, UpdateTaskDto } from './task.dto'

@UseFilters(ServiceUnavailableFilter)
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskMessagePublisherService: TaskMessagePublisherService,
    private readonly taskMessageStateService: TaskMessageStateService,
  ) {}

  @Get()
  async getAll(@Res({ passthrough: true }) res: Response) {
    const tasks = await this.taskService.getAll()

    res.header('Cache-Control', 'private, no-cache, must-revalidate')
    if (tasks.length) {
      const lastModified = Math.max(...tasks.map((task) => task.updatedAt.getTime()))
      res.header('Last-Modified', new Date(lastModified).toUTCString())
    }

    return tasks
  }

  @Get(':id')
  async getOne(@Param() params: TaskIdParamDto, @Res({ passthrough: true }) res: Response) {
    const task = await this.taskService.getOne(params.id)

    if (!task) {
      throw new NotFoundException()
    }

    res.header('Cache-Control', 'private, no-cache, must-revalidate')
    res.header('Last-Modified', task.updatedAt.toUTCString())

    return task
  }

  @Post()
  async createOne(@Body() task: CreateTaskDto, @Res({ passthrough: true }) res: Response) {
    try {
      const createdTask = await this.taskService.createOne(task)
      res.status(HttpStatus.CREATED)
      return createdTask
    } catch (error) {
      if (error instanceof TransientInfrastructureError) {
        return await this.enqueue(res, { key: 'create', payload: task }, error)
      }
      throw error
    }
  }

  @Put(':id')
  async updateOne(@Param() params: TaskIdParamDto, @Body() task: UpdateTaskDto, @Res({ passthrough: true }) res: Response) {
    try {
      const updatedTask = await this.taskService.updateOne(params.id, task)
      if (!updatedTask) {
        throw new NotFoundException()
      }
      res.status(HttpStatus.OK)
      return updatedTask
    } catch (error) {
      if (error instanceof TransientInfrastructureError) {
        return await this.enqueue(res, { key: 'update', payload: { id: params.id, changes: task } }, error)
      }
      throw error
    }
  }

  @Delete()
  async deleteAll(@Res({ passthrough: true }) res: Response) {
    await this.taskService.deleteAll()
    res.status(HttpStatus.NO_CONTENT)
  }

  @Delete(':id')
  async deleteOne(@Param() params: TaskIdParamDto, @Res({ passthrough: true }) res: Response) {
    try {
      const isDeleted = await this.taskService.deleteOne(params.id)
      if (!isDeleted) {
        throw new NotFoundException()
      }
      res.status(HttpStatus.NO_CONTENT)
    } catch (error) {
      if (error instanceof TransientInfrastructureError) {
        return await this.enqueue(res, { key: 'delete', payload: { id: params.id } }, error)
      }
      throw error
    }
  }

  @Get('/queued/:id')
  async getQueuedState(@Param() params: TaskIdParamDto, @Res({ passthrough: true }) res: Response) {
    const state = await this.taskMessageStateService.getState(params.id)
    if (!state) {
      throw new NotFoundException()
    }
    res.header('Cache-Control', 'private, no-store')
    return state
  }

  private async enqueue(
    res: Response,
    message: TaskMessageInput,
    error: TransientInfrastructureError,
  ): Promise<TaskMessageState & { location: string; retryAfter: number }> {
    const state = await this.taskMessagePublisherService.enqueue(message)

    const location = `/tasks/queued/${state.id}`
    const retryAfter = Math.ceil(error.retryAfter / 1000)

    res.setHeader('Location', location)
    res.status(HttpStatus.ACCEPTED)

    return { ...state, location, retryAfter }
  }
}
