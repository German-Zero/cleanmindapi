import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordRequest {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
