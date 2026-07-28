import { IsString, MinLength } from "class-validator";

export class SetPasswordRequest {
  @IsString({ message: 'Ingresa una contraseña válida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string

  @IsString({ message: 'Confirma la contraseña.' })
  @MinLength(8, { message: 'La confirmación debe tener al menos 8 caracteres.' })
  confirmPassword!: string
}
