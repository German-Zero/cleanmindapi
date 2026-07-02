import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { RegisterRequest } from "../requests/register.request";
import { RegisterUserCommand } from "../../application/commands/register-user.command";
import { Public } from "../../../shared/security/decorators/public.decorator";
import { LoginUserCommand } from "../../application/commands/login-user.command";
import { LoginRequest } from "../requests/login.request";
import { RefreshTokenCommand } from "../../application/commands/refresh-token.command";
import { LogoutCommand } from "../../application/commands/logout.command";
import { JwtPayload } from "../../application/common/jwt-payload";
import { CurrentUser } from "../../../shared/security/decorators/current-user.decorator";
import { CurrentUserMapper } from "../../infrastructure/mappers/current-user.mapper";
import { VerifyEmailCommand } from "../../application/commands/verify-email.command";
import { VerifyEmailPort } from "../../application/ports/inbound/verify-email.port";
import { VerifyEmailRequest } from "../requests/verify-email.request";
import { ForgotPasswordRequest } from "../requests/forgot-password.request";
import { ForgotPasswordCommand } from "../../application/commands/forgot-password.command";
import { ResetPasswordUseCase } from "../../application/use-cases/reset-password.usecase";
import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.usecase";
import { ForgotPasswordUseCase } from "../../application/use-cases/forgot-password.usecase";
import { ResetPasswordCommand } from "../../application/commands/reset-password.command";
import { ResetPasswordRequest } from "../requests/reset-password.request";
import { GoogleAuthGuard } from "../guards/google-auth.guard";
import { LoginGoogleCommand } from "../../application/commands/login-google.command";
import { GoogleUser } from "../../application/common/google-user";
import { LoginGoogleUseCase } from "../../application/use-cases/login-google.usecase";
import { CookieService } from "../../../shared/application/services/cookie.service";
import { Response } from "express";
import { CurrentRefreshToken } from "../../../shared/security/decorators/current-refresh-token.decorator";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.usecase";
import { LoginUserUseCase } from "../../application/use-cases/login-user.usecase";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token.usecase";
import { LogoutUserUseCase } from "../../application/use-cases/logout-user.usecase";
import { AuthResponse } from "../response/auth-response";
import { CurrentUserResponse } from "../response/current-user.response";
import { JwtAuthGuard } from "../../../shared/security/guards/jwt-auth.guard";


@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logoutUser: LogoutUserUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly verifyEmailPort: VerifyEmailPort,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly loginGoogleUseCase: LoginGoogleUseCase,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const response =
      await this.registerUser.execute(
        new RegisterUserCommand(
          request.name,
          request.email,
          request.password,
        ),
      );

    this.cookieService.setAccessToken(
      res,
      response.accessToken,
      response.expiresIn,
    );

    this.cookieService.setRefreshToken(
      res,
      response.refreshToken,
      604800,
    );

    return response;
  }

  @Post('login')
  @Public()
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {

    const response =
      await this.loginUserUseCase.execute(
        new LoginUserCommand(
          request.email,
          request.password,
        ),
      );

    this.cookieService.setAccessToken(
      res,
      response.accessToken,
      response.expiresIn,
    );

    this.cookieService.setRefreshToken(
      res,
      response.refreshToken,
      604800,
    );

    return response;
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentRefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const response =
      await this.refreshToken.execute(
        new RefreshTokenCommand(refreshToken),
      );

    this.cookieService.setAccessToken(
      res,
      response.accessToken,
      response.expiresIn,
    );

    this.cookieService.setRefreshToken(
      res,
      response.refreshToken,
      response.expiresIn,
    );

    return response;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentRefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutUser.execute(
      new LogoutCommand(refreshToken),
    );

    this.cookieService.clearTokens(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload): Promise<CurrentUserResponse> {
    const payload = await this.getCurrentUser.execute(user);
    return CurrentUserMapper.toResponse(payload);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Body() request: VerifyEmailRequest): Promise<void> {
    await this.verifyEmailPort.execute(new VerifyEmailCommand(request.code));
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() request: ForgotPasswordRequest,
  ): Promise<void> {
    await this.forgotPasswordUseCase.execute(
      new ForgotPasswordCommand(
        request.email,
      ),
    );
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Body() request: ResetPasswordRequest,
  ): Promise<void> {
    await this.resetPasswordUseCase.execute(
      new ResetPasswordCommand(
        request.token,
        request.password,
      ),
    );
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {
    // .
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: GoogleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {

    const response =
      await this.loginGoogleUseCase.execute(
        new LoginGoogleCommand(
          user.email,
          user.name,
          user.avatarUrl,
        ),
      );

    this.cookieService.setAccessToken(
      res,
      response.accessToken,
      response.expiresIn,
    );

    this.cookieService.setRefreshToken(
      res,
      response.refreshToken,
      604800,
    );

    return response;
  }
}
