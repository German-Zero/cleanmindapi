import { Task } from "../../../tasks/domain/entities/task.entity";

export interface DashboardSummary {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
}

export interface QuadrantSumarry {
  do: number;
  plan: number
  delegate: number
  delete: number
}

export interface DashboardModel {
  summary: DashboardSummary
  quadrants: QuadrantSumarry
  today: Task[]
  overdue: Task[]
  upcoming: Task[]
}

