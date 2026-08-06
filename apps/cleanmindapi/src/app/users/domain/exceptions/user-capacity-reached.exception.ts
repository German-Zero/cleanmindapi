import { ConflictException } from '@nestjs/common';

export class UserCapacityReachedException extends ConflictException {
  constructor(maxUsers: number) {
    super(`El límite de ${maxUsers} usuarios ya fue alcanzado.`);
  }
}
