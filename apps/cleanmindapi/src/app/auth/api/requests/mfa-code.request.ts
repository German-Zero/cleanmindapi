import { IsString, Matches } from 'class-validator';

export class MfaCodeRequest {
  @IsString({ message: 'Ingresa un código válido.' })
  @Matches(/^(?:\d{6}|CM-(?:[A-Fa-f0-9]{4}-){3}[A-Fa-f0-9]{4})$/, { message: 'Ingresa un código de 6 dígitos o un código de recuperación válido.' })
  code!: string;
}
