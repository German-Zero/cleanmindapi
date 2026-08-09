import { TaskResponseMapper } from "../../../../tasks/application/common/mapper/task-response.mapper";
import { Task } from "../../../../tasks/domain/entities/task.entity";
import { User } from "../../../../users/domain/entities/user.entity";
import { UserSettingsResponse } from "../../../../settings/application/common/responses/user-settings.response";
import { DashboardModel } from "../../../domain/models/dashboard.model";
import { DashboardResponse } from "../responses/dashboard.response";

export class DashboardResponseMapper {
  static toResponse(
    model: DashboardModel,
    tasks: Task[],
    user: User,
    settings: UserSettingsResponse,
  ): DashboardResponse {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        role: user.role,
        avatarUrl: user.avatarUrl,
        hasPassword: Boolean(user.passwordHash),
        needsOnboarding: user.onboardingCompletedAt === null,
      },

      settings,

      tasks: TaskResponseMapper.toResponseList(tasks),

      summary: {
        total: model.summary.total,
        todo: model.summary.todo,
        inProgress: model.summary.inProgress,
        completed: model.summary.completed,
      },

      quadrants: {
        do: model.quadrants.do,
        plan: model.quadrants.plan,
        delegate: model.quadrants.delegate,
        delete: model.quadrants.delete,
      },

      today: TaskResponseMapper.toResponseList(
        model.today,
      ),

      overdue: TaskResponseMapper.toResponseList(
        model.overdue,
      ),

      upcoming: TaskResponseMapper.toResponseList(
        model.upcoming,
      ),

      pomodoro: model.pomodoro,
    };
  }
}
