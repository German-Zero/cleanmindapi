import { IsEmail } from "class-validator";

export class ForgotPasswordRequest {
  @IsEmail({}, { message: 'Ingresa un email válido.' })
  email!: string;
}
