import { Module } from "@nestjs/common";
import { TaskModule } from "../tasks/tasks.module";

import { DashboardController } from "./api/controllers/dashboard.controller";

import { DashboardBuilderService } from "./application/services/dashboard-builder.service";

import { GetDashboardUseCase } from "./application/use-cases/get-dashboard.usecase";

import { GetDashboardPort } from "./application/ports/inbound/get-dashboard.port";
import { PomodoroModule } from "../pomodoro/pomodoro.module";

@Module({
  imports: [
    TaskModule,
    PomodoroModule,
  ],
  controllers: [
    DashboardController
  ],
  providers: [

    // Services

    DashboardBuilderService,

    // UseCases

    GetDashboardUseCase,
    {
      provide: GetDashboardPort,
      useExisting: GetDashboardUseCase,
    }
  ]
})
export class DashboardModule {}
