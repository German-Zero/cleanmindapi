import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CreateTaskPort } from '../../application/ports/inbound/create-task.port';
import { UpdateTaskPort } from '../../application/ports/inbound/update-task.port';
import { DeleteTaskPort } from '../../application/ports/inbound/delete-task.port';
import { GetTaskPort } from '../../application/ports/inbound/get-task.port';
import { GetTasksPort } from '../../application/ports/inbound/get-tasks.port';
import { StartTaskPort } from '../../application/ports/inbound/start-task.port';
import { CompleteTaskPort } from '../../application/ports/inbound/complete-task.port';
import { ReopenTaskPort } from '../../application/ports/inbound/reopen-task.port';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CreateTaskRequest } from '../requests/create-task.request';
import { TaskResponse } from '../../application/common/responses/task.response';
import { CreateTaskCommand } from '../../application/commands/create-task.command';
import { GetTasksQuery } from '../../application/queries/get-tasks.query';
import { GetTaskQuery } from '../../application/queries/get-task.query';
import { UpdateTaskRequest } from '../requests/update-task.request';
import { UpdateTaskCommand } from '../../application/commands/update-task.command';
import { DeleteTaskCommand } from '../../application/commands/delete-task.command';
import { TaskActionCommand } from '../../application/commands/task-action.command';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createTask: CreateTaskPort,
    private readonly updateTask: UpdateTaskPort,
    private readonly deleteTask: DeleteTaskPort,
    private readonly getTask: GetTaskPort,
    private readonly getTasks: GetTasksPort,
    private readonly startTask: StartTaskPort,
    private readonly completeTask: CompleteTaskPort,
    private readonly reopenTask: ReopenTaskPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() req: CreateTaskRequest,
  ): Promise<TaskResponse> {
    return this.createTask.execute(
      new CreateTaskCommand(
        user.sub,
        req.title,
        req.description ?? null,
        req.isImportant,
        req.isUrgent,
        req.dueDate ? new Date(req.dueDate) : null,
      ),
    );
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload): Promise<TaskResponse[]> {
    return this.getTasks.execute(new GetTasksQuery(user.sub));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<TaskResponse> {
    return this.getTask.execute(new GetTaskQuery(id, user.sub));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() req: UpdateTaskRequest,
  ): Promise<TaskResponse> {
    return this.updateTask.execute(
      new UpdateTaskCommand(
        id,
        user.sub,
        req.title,
        req.description ?? null,
        req.isImportant,
        req.isUrgent,
        req.dueDate ? new Date(req.dueDate) : null,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteTask.execute(new DeleteTaskCommand(id, user.sub));
  }

  @Patch(':id/start')
  async start(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<TaskResponse> {
    return this.startTask.execute(new TaskActionCommand(id, user.sub));
  }

  @Patch(':id/complete')
  async complete(
    @CurrentUser() useR: JwtPayload,
    @Param('id') id: string,
  ): Promise<TaskResponse> {
    return this.completeTask.execute(new TaskActionCommand(id, useR.sub));
  }

  @Patch(':id/reopen')
  async reopen(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<TaskResponse> {
    return this.reopenTask.execute(new TaskActionCommand(id, user.sub));
  }
}
