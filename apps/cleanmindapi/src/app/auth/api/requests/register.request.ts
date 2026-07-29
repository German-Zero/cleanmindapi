import { Equals, IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterRequest {
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'Ingresa tu nombre.' })
  name!: string;

  @IsEmail({}, { message: 'Ingresa un email válido.' })
  email!: string;

  @IsString({ message: 'Ingresa una contraseña válida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string;

  @IsBoolean({ message: 'Debes confirmar la aceptación de los términos.' })
  @Equals(true, { message: 'Debes aceptar los términos y la política de privacidad.' })
  acceptedTerms!: boolean;
}
