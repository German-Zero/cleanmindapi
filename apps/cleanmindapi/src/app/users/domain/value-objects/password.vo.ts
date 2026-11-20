import { InvalidPasswordException } from '../exceptions/invalid-password.exception';

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (password.length < 8) {
      throw new InvalidPasswordException();
    }

    this.value = password;
  }

  getValue(): string {
    return this.value;
  }
}
