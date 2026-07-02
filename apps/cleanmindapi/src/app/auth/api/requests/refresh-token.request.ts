import { IsJWT, IsNotEmpty } from "class-validator";

export class RefreshTokenRequest {
  @IsJWT()
  @IsNotEmpty()
  refreshToken!: string;
}
