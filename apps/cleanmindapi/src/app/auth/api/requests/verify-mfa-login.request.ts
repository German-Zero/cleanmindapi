import { IsString, Length, Matches } from 'class-validator';

export class VerifyMfaLoginRequest {
  @IsString({ message: 'La verificación no es válida o ya venció.' })
  @Length(43, 128, { message: 'La verificación no es válida o ya venció.' })
  challengeToken!: string;

  @IsString({ message: 'Ingresa un código válido.' })
  @Matches(/^(?:\d{6}|CM-(?:[A-Fa-f0-9]{4}-){3}[A-Fa-f0-9]{4})$/, { message: 'Ingresa un código de 6 dígitos o un código de recuperación válido.' })
  code!: string;
}
