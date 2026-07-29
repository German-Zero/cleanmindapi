import { Injectable } from "@nestjs/common";
import { CompleteTaskPort } from "../../ports/inbound/complete-task.port";
import { TaskActionCommand } from "../../commands/task-action.command";
import { TaskResponse } from "../../common/responses/task.response";
import { TaskOwnerService } from "../../services/task-owner.service";
import { TaskPersistenceService } from "../../services/task-persistence.service";
import { TaskStatus } from "../../../domain/enums/task-status.enum";
import { UserRepository } from "../../../../users/domain/repositories/user.repository";
import { NotificationFactory } from "../../../../notifications/application/factories/notification.factory";
import { NotificationDispatcherService } from "../../../../notifications/application/services/notification-dispatcher.service";

@Injectable()
export class CompleteTaskUseCase implements CompleteTaskPort {
  constructor(
    private readonly taskPersistenceService: TaskPersistenceService,
    private readonly taskOwnerService: TaskOwnerService,
    private readonly users: UserRepository,
    private readonly notifications: NotificationFactory,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async execute(command: TaskActionCommand): Promise<TaskResponse> {
    const task = await this.taskOwnerService.getOwnedTask( command.taskId, command.userId );
    const wasCompleted = task.status === TaskStatus.COMPLETED;

    task.complete();

    const response = await this.taskPersistenceService.save(task);

    if (!wasCompleted) {
      const user = await this.users.findById(command.userId);

      if (user) {
        await this.dispatcher.send(
          command.userId,
          this.notifications.buildTaskCompleted(
            user.email.getValue(),
            task.title,
          ),
        );
      }
    }

    return response;
  }
}
