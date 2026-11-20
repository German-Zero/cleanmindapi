import { DomainError } from '../../../shared/domain/errors/domain-error';

export class TaskNotFoundException extends DomainError {
  constructor() {
    super('TASK_NOT_FOUND', 'Task Not Found.');
  }
}
