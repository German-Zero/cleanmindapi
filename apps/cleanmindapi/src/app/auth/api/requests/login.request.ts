import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginRequest {
  @IsEmail({}, { message: 'Ingresa un email válido.' })
  email!: string;

  @IsString({ message: 'Ingresa una contraseña válida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string;
}
