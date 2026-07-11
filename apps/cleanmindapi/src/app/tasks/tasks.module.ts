import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";

import { TaskController } from "./api/controllers/task.controller"

import { TaskOwnerService } from "./application/services/task-owner.service";
import { TaskPersistenceService } from "./application/services/task-persistence.service";

import { GetTaskUseCase } from "./application/use-cases/get/get-task.usecase";
import { GetTasksUseCase } from "./application/use-cases/get/get-tasks.usecase";
import { CompleteTaskUseCase } from "./application/use-cases/status/complete-task.usecase";
import { ReopenTaskUseCase } from "./application/use-cases/status/reopen-task.usecase";
import { StartTaskUseCase } from "./application/use-cases/status/start-task.usecase";
import { CreateTaskUseCase } from "./application/use-cases/create-task.usecase";
import { DeleteTaskUseCase } from "./application/use-cases/delete-task.usecase";
import { UpdateTaskUseCase } from "./application/use-cases/update-task.usecase";

import { GetTaskPort } from "./application/ports/inbound/get-task.port";
import { GetTasksPort } from "./application/ports/inbound/get-tasks.port";
import { CompleteTaskPort } from "./application/ports/inbound/complete-task.port";
import { ReopenTaskPort } from "./application/ports/inbound/reopen-task.port";
import { StartTaskPort } from "./application/ports/inbound/start-task.port";
import { CreateTaskPort } from "./application/ports/inbound/create-task.port";
import { DeleteTaskPort } from "./application/ports/inbound/delete.task.port";
import { UpdateTaskPort } from "./application/ports/inbound/update-task.port";

import { PrismaTaskRepository } from "./infrastructure/repositories/prisma-task.repository";

import { TaskRepository } from "./domain/repositories/task.repository";
import { PrismaUserRepository } from "../users/infrastructure/repositories/prisma-user.repository";
import { UserRepository } from "../users/domain/repositories/user.repository";

@Module({
  imports: [
    UsersModule
  ],
  controllers: [
    TaskController,
  ],
  providers: [

    // Use-Cases

    GetTaskUseCase,
    {
      provide: GetTaskPort,
      useExisting: GetTaskUseCase
    },

    GetTasksUseCase,
    {
      provide: GetTasksPort,
      useExisting: GetTasksUseCase,
    },

    CompleteTaskUseCase,
    {
      provide: CompleteTaskPort,
      useExisting: CompleteTaskUseCase,
    },

    ReopenTaskUseCase,
    {
      provide: ReopenTaskPort,
      useExisting: ReopenTaskUseCase
    },

    StartTaskUseCase,
    {
      provide: StartTaskPort,
      useExisting: StartTaskUseCase,
    },

    CreateTaskUseCase,
    {
      provide: CreateTaskPort,
      useExisting: CreateTaskUseCase,
    },

    DeleteTaskUseCase,
    {
      provide: DeleteTaskPort,
      useExisting: DeleteTaskUseCase,
    },

    UpdateTaskUseCase,
    {
      provide: UpdateTaskPort,
      useExisting: UpdateTaskUseCase,
    },

    // Serivces

    TaskOwnerService,
    TaskPersistenceService,

    // Repositories

    PrismaTaskRepository,
    {
      provide: TaskRepository,
      useExisting: PrismaTaskRepository,
    },

    PrismaUserRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUserRepository,
    },

  ],
  exports: [],
})
export class TaskModule {}
