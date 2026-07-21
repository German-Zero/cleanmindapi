import { IsString, Matches } from 'class-validator';

export class MfaCodeRequest {
  @IsString()
  @Matches(/^(?:\d{6}|CM-(?:[A-Fa-f0-9]{4}-){3}[A-Fa-f0-9]{4})$/)
  code!: string;
}
