import { DomainError } from '../../../shared/domain/errors/domain-error';

export class EmailAlreadyExistsException extends DomainError {
  constructor() {
    super('EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con este email.');
  }
}
