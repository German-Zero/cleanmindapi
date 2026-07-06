import { IsString, Length } from "class-validator";

export class VerifyEmailRequest {
  @IsString()
  @Length(6, 6)
  code!: string;
}
