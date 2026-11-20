import { DomainError } from '../../../shared/domain/errors/domain-error';

export class PomodoroSessionTransitionException extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}
