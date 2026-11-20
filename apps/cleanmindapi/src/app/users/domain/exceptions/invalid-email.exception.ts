import { DomainError } from '../../../shared/domain/errors/domain-error';

export class InvalidEmailException extends DomainError {
  constructor() {
    super('INVALID_EMAIL', 'Ingresa un email válido.');
  }
}
