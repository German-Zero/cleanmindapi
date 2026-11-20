import { DomainError } from '../../../shared/domain/errors/domain-error';

export class InvalidCredentialsException extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'El email o la contraseña son incorrectos.');
  }
}
