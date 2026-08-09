import { NotificationFactory } from '../../../../notifications/application/factories/notification.factory';
import { NotificationDispatcherService } from '../../../../notifications/application/services/notification-dispatcher.service';
import { RewardsService } from '../../../../rewards/application/services/rewards.service';
import { User } from '../../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../../users/domain/repositories/user.repository';
import { Email } from '../../../../users/domain/value-objects/email.vo';
import { Task } from '../../../domain/entities/task.entity';
import { TaskQuadrant } from '../../../domain/enums/task-quadrant.enum';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskActionCommand } from '../../commands/task-action.command';
import { TaskOwnerService } from '../../services/task-owner.service';
import { TaskPersistenceService } from '../../services/task-persistence.service';
import { CompleteTaskUseCase } from './complete-task.usecase';

describe('CompleteTaskUseCase', () => {
  const userId = 'user-1';
  const taskId = 'task-1';

  const task = (status: TaskStatus) =>
    Task.restore({
      id: taskId,
      userId,
      title: 'Preparar entrega',
      description: null,
      isImportant: true,
      isUrgent: true,
      quadrant: TaskQuadrant.DO,
      status,
      dueDate: null,
      completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const user = User.createLocal({
    name: 'Ada Lovelace',
    email: new Email('ada@example.com'),
    passwordHash: 'hash',
  });

  const setup = (status: TaskStatus) => {
    const ownedTask = task(status);
    const persistence = {
      save: jest.fn().mockResolvedValue({ id: taskId }),
    } as unknown as TaskPersistenceService;
    const owner = {
      getOwnedTask: jest.fn().mockResolvedValue(ownedTask),
    } as unknown as TaskOwnerService;
    const users = {
      findById: jest.fn().mockResolvedValue(user),
    } as unknown as UserRepository;
    const dispatcher = {
      send: jest.fn().mockResolvedValue(undefined),
    } as unknown as NotificationDispatcherService;
    const rewards = {
      awardTaskCompletion: jest.fn().mockResolvedValue({
        pointsAwarded: status === TaskStatus.COMPLETED ? 0 : 5,
        balance: 15,
        earnedThisMonth: 15,
        monthlyLimit: 100,
        remainingThisMonth: 85,
      }),
    } as unknown as RewardsService;

    return {
      dispatcher,
      rewards,
      useCase: new CompleteTaskUseCase(
        persistence,
        owner,
        users,
        new NotificationFactory(),
        dispatcher,
        rewards,
      ),
    };
  };

  it('envía la notificación habilitada al completar una tarea', async () => {
    const { dispatcher, rewards, useCase } = setup(TaskStatus.IN_PROGRESS);

    const result = await useCase.execute(new TaskActionCommand(taskId, userId));

    expect(dispatcher.send).toHaveBeenCalledTimes(1);
    expect(dispatcher.send).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        type: 'TASK_COMPLETED',
      }),
    );
    expect(rewards.awardTaskCompletion).toHaveBeenCalledWith(userId, taskId);
    expect(result).toEqual(
      expect.objectContaining({
        reward: expect.objectContaining({ pointsAwarded: 5 }),
      }),
    );
  });

  it('no duplica la notificación de una tarea ya completada', async () => {
    const { dispatcher, rewards, useCase } = setup(TaskStatus.COMPLETED);

    await useCase.execute(new TaskActionCommand(taskId, userId));

    expect(dispatcher.send).not.toHaveBeenCalled();
    expect(rewards.awardTaskCompletion).toHaveBeenCalledWith(userId, taskId);
  });
});
