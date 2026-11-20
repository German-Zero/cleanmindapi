import { Injectable } from '@nestjs/common';
import { GetTaskPort } from '../../ports/inbound/get-task.port';
import { GetTaskQuery } from '../../queries/get-task.query';
import { TaskResponse } from '../../common/responses/task.response';
import { TaskResponseMapper } from '../../common/mapper/task-response.mapper';
import { TaskOwnerService } from '../../services/task-owner.service';

@Injectable()
export class GetTaskUseCase implements GetTaskPort {
  constructor(private readonly taskOwnerService: TaskOwnerService) {}

  async execute(query: GetTaskQuery): Promise<TaskResponse> {
    const task = await this.taskOwnerService.getOwnedTask(
      query.taskId,
      query.userId,
    );

    return TaskResponseMapper.toResponse(task);
  }
}
