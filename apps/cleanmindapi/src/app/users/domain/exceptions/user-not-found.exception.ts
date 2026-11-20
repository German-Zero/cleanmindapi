import { DomainError } from '../../../shared/domain/errors/domain-error';

export class UserNotFoundException extends DomainError {
  constructor() {
    super('USER_NOT_FOUND', 'No encontramos el usuario.');
  }
}
