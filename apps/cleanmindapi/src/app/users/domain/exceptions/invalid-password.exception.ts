import { DomainError } from '../../../shared/domain/errors/domain-error';

export class InvalidPasswordException extends DomainError {
  constructor() {
    super(
      'INVALID_PASSWORD',
      'La contraseña debe tener al menos 8 caracteres.',
    );
  }
}
