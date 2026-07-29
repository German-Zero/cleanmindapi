import { IsString, MinLength } from "class-validator";

export class ChangePasswordRequest {
  @IsString({ message: 'Ingresa tu contraseña actual.' })
  currentPassword!: string;

  @IsString({ message: 'Ingresa una contraseña nueva válida.' })
  @MinLength(8, { message: 'La contraseña nueva debe tener al menos 8 caracteres.' })
  newPassword!: string;

  @IsString({ message: 'Confirma la contraseña nueva.' })
  @MinLength(8, { message: 'La confirmación debe tener al menos 8 caracteres.' })
  confirmPassword!: string;
}
