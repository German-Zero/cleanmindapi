import { BadRequestException } from "@nestjs/common";

export class Email {
  private readonly value: string;

  constructor(email: string) {
    const normalized = email.trim().toLowerCase();

    if (!Email.isValid(normalized)) {
      throw new BadRequestException('Ingresa un email válido.');
    }

    this.value = normalized
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
