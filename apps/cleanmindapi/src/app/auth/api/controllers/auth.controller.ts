import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { LoginDto } from "../../dto/login.dto";
import { RegisterDto } from "../../dto/register.dto";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../../application/use-cases/login-user.use-case";
import { JwtAuthGuard } from "../../../common/auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/auth/decorators/current-user.decorator";
import { AuthUser } from "../../../common/auth/interfaces/auth-user.interface";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser,) {
    return user;
  }
}
