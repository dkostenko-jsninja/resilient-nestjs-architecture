import { PartialType } from '@nestjs/mapped-types'
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'
import { CreateTaskInput, TaskStatus } from 'src/modules/tasks/entities/task.entity'

export class CreateTaskDto implements CreateTaskInput {
  @IsString()
  name: string

  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class TaskIdParamDto {
  @IsUUID()
  id: string
}
