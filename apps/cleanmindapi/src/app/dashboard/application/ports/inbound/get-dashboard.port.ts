import { GetDashboardQuery } from '../../queries/get-dashboard.query';
import { DashboardResponse } from '../../common/responses/dashboard.response';

export abstract class GetDashboardPort {
  abstract execute(query: GetDashboardQuery): Promise<DashboardResponse>;
}
