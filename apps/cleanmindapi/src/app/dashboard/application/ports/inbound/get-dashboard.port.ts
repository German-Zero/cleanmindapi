import { GetDashboardCommand } from "../../commands/get-dashboard.command";
import { DashboardResponse } from "../../common/responses/dashboard.response";

export abstract class GetDashboardPort {
  abstract execute(command: GetDashboardCommand): Promise<DashboardResponse>
}
