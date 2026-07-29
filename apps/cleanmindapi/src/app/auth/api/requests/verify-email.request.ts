import { IsString, Length } from "class-validator";

export class VerifyEmailRequest {
  @IsString({ message: 'Ingresa un código válido.' })
  @Length(6, 6, { message: 'El código debe tener 6 dígitos.' })
  code!: string;
}
