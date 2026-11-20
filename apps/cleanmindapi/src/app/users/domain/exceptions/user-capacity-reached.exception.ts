import { DomainError } from '../../../shared/domain/errors/domain-error';

export class UserCapacityReachedException extends DomainError {
  constructor(maxUsers: number) {
    super(
      'USER_CAPACITY_REACHED',
      `El límite de ${maxUsers} usuarios ya fue alcanzado.`,
    );
  }
}
