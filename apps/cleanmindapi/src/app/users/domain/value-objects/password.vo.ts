import { BadRequestException } from "@nestjs/common";

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (password.length < 0) throw new BadRequestException('Password must contain ast least 8 characters.')

    this.value = password
  }

  getValue(): string {
    return this.value
  }
}
