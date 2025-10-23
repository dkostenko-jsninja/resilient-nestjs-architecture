import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Res, UseFilters } from '@nestjs/common'
import type { Response } from 'express'
import { ServiceUnavailableFilter } from 'src/common/interface/api/http/filters/service-unavailable.filter'
import { TaskService } from 'src/modules/tasks/services/task.service'
import { CreateTaskDto, TaskIdParamDto, UpdateTaskDto } from './task.dto'

@UseFilters(ServiceUnavailableFilter)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

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
  @HttpCode(201)
  createOne(@Body() task: CreateTaskDto) {
    return this.taskService.createOne(task)
  }

  @Put(':id')
  async updateOne(@Param() params: TaskIdParamDto, @Body() task: UpdateTaskDto) {
    const updatedTask = await this.taskService.updateOne(params.id, task)
    if (!updatedTask) {
      throw new NotFoundException()
    }
    return updatedTask
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteOne(@Param() params: TaskIdParamDto) {
    const isDeleted = await this.taskService.deleteOne(params.id)
    if (!isDeleted) {
      throw new NotFoundException()
    }
  }
}
