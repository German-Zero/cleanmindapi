import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { GetTasksPort } from '../../ports/inbound/get-tasks.port';
import { GetTasksQuery } from '../../queries/get-tasks.query';
import { TaskResponse } from '../../common/responses/task.response';
import { TaskResponseMapper } from '../../common/mapper/task-response.mapper';

@Injectable()
export class GetTasksUseCase implements GetTasksPort {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: GetTasksQuery): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findAllByUser(
      query.userId,
      query.query,
    );

    return TaskResponseMapper.toResponseList(tasks);
  }
}
