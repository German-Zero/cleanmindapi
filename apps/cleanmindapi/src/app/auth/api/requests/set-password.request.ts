import { IsString, MinLength } from "class-validator";

export class SetPasswordRequest {
  @IsString()
  @MinLength(8)
  password!: string

  @IsString()
  @MinLength(8)
  confirmPassword!: string
}
