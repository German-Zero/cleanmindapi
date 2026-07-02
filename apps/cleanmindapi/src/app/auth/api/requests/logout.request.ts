import { IsJWT, IsNotEmpty } from "class-validator";

export class LogoutRequest {
  @IsJWT()
  @IsNotEmpty()
  refreshToken!: string
}
