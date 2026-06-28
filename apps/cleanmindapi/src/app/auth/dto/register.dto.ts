import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {

  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string

  @IsString({ message: 'First name must be a string' })
  firstName!: string;

  @IsString({ message: 'Last name must be a string' })
  lastName!: string;
}
