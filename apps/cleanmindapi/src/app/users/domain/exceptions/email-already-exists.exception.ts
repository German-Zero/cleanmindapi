import { ConflictException } from "@nestjs/common";

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super('Ya existe una cuenta con este email.');
  }
}
