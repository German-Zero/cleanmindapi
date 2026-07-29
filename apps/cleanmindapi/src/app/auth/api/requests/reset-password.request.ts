import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordRequest {
  @IsString({ message: 'El enlace de recuperación no es válido.' })
  @IsNotEmpty({ message: 'El enlace de recuperación no es válido.' })
  token!: string;

  @IsString({ message: 'Ingresa una contraseña válida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string;
}
