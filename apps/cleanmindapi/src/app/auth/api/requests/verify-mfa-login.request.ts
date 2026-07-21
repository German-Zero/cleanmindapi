import { IsString, Length, Matches } from 'class-validator';

export class VerifyMfaLoginRequest {
  @IsString()
  @Length(43, 128)
  challengeToken!: string;

  @IsString()
  @Matches(/^(?:\d{6}|CM-(?:[A-Fa-f0-9]{4}-){3}[A-Fa-f0-9]{4})$/)
  code!: string;
}
