import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Res } from '@nestjs/common'
import type { Response } from 'express'
import type { Task } from '../../../entities/task.entity'
import { TaskService } from '../../../services/task.service'

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
  async getOne(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const task = await this.taskService.getOne(id)

    if (!task) {
      throw new NotFoundException()
    }

    res.header('Cache-Control', 'private, no-cache, must-revalidate')
    res.header('Last-Modified', task.updatedAt.toUTCString())

    return task
  }

  @Post()
  @HttpCode(201)
  createOne(@Body() task: Task) {
    return this.taskService.createOne(task)
  }

  @Put(':id')
  async updateOne(@Param('id') id: string, @Body() task: Task) {
    const updatedTask = await this.taskService.updateOne(id, task)
    if (!updatedTask) {
      throw new NotFoundException()
    }
    return updatedTask
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteOne(@Param('id') id: string) {
    const isDeleted = await this.taskService.deleteOne(id)
    if (!isDeleted) {
      throw new NotFoundException()
    }
  }
}
