import { UnauthorizedException } from "@nestjs/common";

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('El email o la contraseña son incorrectos.');
  }
}
