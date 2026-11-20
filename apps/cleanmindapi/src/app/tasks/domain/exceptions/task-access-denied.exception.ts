import { DomainError } from '../../../shared/domain/errors/domain-error';

export class TaskAccessDeniedException extends DomainError {
  constructor() {
    super(
      'TASK_ACCESS_DENIED',
      'You do not have permission to access this task.',
    );
  }
}
