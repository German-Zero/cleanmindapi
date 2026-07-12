import { TaskResponseMapper } from "../../../../tasks/application/common/mapper/task-response.mapper";
import { DashboardModel } from "../../../domain/models/dashboard.model";
import { DashboardResponse } from "../responses/dashboard.response";

export class DashboardResponseMapper {
  static toResponse(
    model: DashboardModel,
  ): DashboardResponse {
    return {
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
    };
  }
}
