import { BadRequestException } from "@nestjs/common";

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (password.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres.');
    }

    this.value = password
  }

  getValue(): string {
    return this.value
  }
}
