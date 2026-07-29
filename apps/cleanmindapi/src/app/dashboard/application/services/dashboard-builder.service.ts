import { Injectable } from "@nestjs/common";
import { DashboardModel } from "../../domain/models/dashboard.model";
import { Task } from "../../../tasks/domain/entities/task.entity";
import { TaskStatus } from "../../../tasks/domain/enums/task-status.enum";
import { TaskQuadrant } from "@prisma/client";
import { PomodoroSummary } from "../../../pomodoro/domain/models/pomodoro.model";

@Injectable()
export class DashboardBuilderService {
  build(tasks: Task[], pomodoro: PomodoroSummary['today']): DashboardModel {
    const now = new Date();

    const startOfToday = this.startOfDay(now);
    const endOfToday = this.endOfDay(now);

    return {
      summary: {
        total: tasks.length,

        todo: this.countByStatus(
          tasks,
          TaskStatus.TODO,
        ),

        inProgress: this.countByStatus(
          tasks,
          TaskStatus.IN_PROGRESS,
        ),

        completed: this.countByStatus(
          tasks,
          TaskStatus.COMPLETED,
        ),
      },

      quadrants: {
        do: this.countByQuadrant(
          tasks,
          TaskQuadrant.DO,
        ),

        plan: this.countByQuadrant(
          tasks,
          TaskQuadrant.PLAN,
        ),

        delegate: this.countByQuadrant(
          tasks,
          TaskQuadrant.DELEGATE,
        ),

        delete: this.countByQuadrant(
          tasks,
          TaskQuadrant.DELETE,
        ),
      },

      today: tasks.filter(
        task =>
          task.dueDate !== null &&
          task.dueDate >= startOfToday &&
          task.dueDate <= endOfToday &&
          task.status !== TaskStatus.COMPLETED,
      ),

      overdue: tasks.filter(
        task =>
          task.dueDate !== null &&
          task.dueDate < startOfToday &&
          task.status !== TaskStatus.COMPLETED,
      ),

      upcoming: tasks.filter(
        task =>
          task.dueDate !== null &&
          task.dueDate > endOfToday &&
          task.status !== TaskStatus.COMPLETED,
      ),

      pomodoro,
    };
  }

  private countByStatus(tasks: Task[], status: TaskStatus): number {
    return tasks.filter(
      task => task.status === status,
    ).length;
  }

  private countByQuadrant( tasks: Task[], quadrant: TaskQuadrant, ): number {
    return tasks.filter(
      task => task.quadrant === quadrant,
    ).length;
  }

  private startOfDay(date: Date): Date {
    const start = new Date(date);

    start.setHours(0, 0, 0, 0);

    return start;
  }

  private endOfDay(date: Date): Date {
    const end = new Date(date);

    end.setHours(23, 59, 59, 999);

    return end;
  }
}
