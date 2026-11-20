import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RegisterRequest } from '../requests/register.request';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { Public } from '../../../shared/security/decorators/public.decorator';
import { LoginUserCommand } from '../../application/commands/login-user.command';
import { LoginRequest } from '../requests/login.request';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { LogoutCommand } from '../../application/commands/logout.command';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { LoginGoogleCommand } from '../../application/commands/login-google.command';
import { GoogleUser } from '../../application/common/google-user';
import { LoginGooglePort } from '../../application/ports/inbound/login-google.port';
import { CookieService } from '../services/cookie.service';
import { Response } from 'express';
import { CurrentRefreshToken } from '../../../shared/security/decorators/current-refresh-token.decorator';
import { RegisterUserPort } from '../../application/ports/inbound/register-user.port';
import { LoginUserPort } from '../../application/ports/inbound/login-user.port';
import { RefreshTokenPort } from '../../application/ports/inbound/refresh-token.port';
import { LogoutPort } from '../../application/ports/inbound/logout.port';
import { LoginResponse, MfaRequiredResponse } from '../../application/common/responses/auth-response';
import { ConfigService } from '@nestjs/config';
import { BetaRegistrationException } from '../../application/services/closed-beta-registration.service';
import { RegistrationStatusResponse } from '../../application/common/responses/registration-status.response';
import { ApplicationError, ApplicationErrorCode } from '../../../shared/application/errors/application-error';
import { RegistrationStatusPort } from '../../application/ports/inbound/registration-status.port';
import { PublicAuthRateLimitGuard } from '../guards/public-auth-rate-limit.guard';
import { AuthApiResponse, AuthApiResponseMapper } from '../mapper/auth-api-response.mapper';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserPort,
    private readonly loginUser: LoginUserPort,
    private readonly refreshToken: RefreshTokenPort,
    private readonly logoutUser: LogoutPort,
    private readonly loginGoogle: LoginGooglePort,
    private readonly cookieService: CookieService,
    private readonly config: ConfigService,
    private readonly registrationStatusPort: RegistrationStatusPort,
  ) {}

  @Get('registration-status')
  @Public()
  @Header('Cache-Control', 'no-store')
  registrationStatus(): Promise<RegistrationStatusResponse> {
    return this.registrationStatusPort.getStatus();
  }

  @Post('register')
  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthApiResponse> {
    const response = await this.registerUser.execute(
      new RegisterUserCommand(
        request.name,
        request.email,
        request.password,
        request.acceptedTerms,
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
      response.refreshExpiresIn,
    );

    return AuthApiResponseMapper.toResponse(response);
  }

  @Post('login')
  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @Header('Cache-Control', 'no-store')
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthApiResponse | MfaRequiredResponse> {
    const response = await this.loginUser.execute(
      new LoginUserCommand(request.email, request.password),
    );

    if ('challengeToken' in response) {
      this.cookieService.clearTokens(res);
      return response;
    }

    this.cookieService.setAccessToken(
      res,
      response.accessToken,
      response.expiresIn,
    );

    this.cookieService.setRefreshToken(
      res,
      response.refreshToken,
      response.refreshExpiresIn,
    );

    return AuthApiResponseMapper.toResponse(response);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentRefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthApiResponse> {
    try {
      const response = await this.refreshToken.execute(
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
        response.refreshExpiresIn,
      );

      return AuthApiResponseMapper.toResponse(response);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        (error instanceof ApplicationError &&
          error.code === ApplicationErrorCode.AUTH_UNAUTHORIZED)
      ) {
        this.cookieService.clearTokens(res);
      }
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentRefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutUser.execute(new LogoutCommand(refreshToken));

    this.cookieService.clearTokens(res);
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
  @Header('Cache-Control', 'no-store')
  async googleCallback(
    @CurrentUser() user: GoogleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    let response: LoginResponse;

    try {
      response = await this.loginGoogle.execute(
        new LoginGoogleCommand(user.email, user.name, user.avatarUrl),
      );
    } catch (error) {
      if (!(error instanceof BetaRegistrationException)) throw error;

      this.cookieService.clearTokens(res);
      const loginUrl = new URL(
        '/login',
        this.config.getOrThrow<string>('auth.frontend.url'),
      );
      loginUrl.searchParams.set('googleRegistrationError', error.reason);
      res.redirect(HttpStatus.FOUND, loginUrl.toString());
      return;
    }

    if ('challengeToken' in response) {
      this.cookieService.clearTokens(res);
      const loginUrl = new URL(
        '/login',
        this.config.getOrThrow<string>('auth.frontend.url'),
      );
      loginUrl.searchParams.set('googleMfaChallenge', response.challengeToken);
      loginUrl.searchParams.set(
        'googleMfaExpiresIn',
        String(response.expiresIn),
      );
      res.redirect(HttpStatus.FOUND, loginUrl.toString());
      return;
    }

    this.cookieService.setAccessToken(
      res,
      response.accessToken,
      response.expiresIn,
    );

    this.cookieService.setRefreshToken(
      res,
      response.refreshToken,
      response.refreshExpiresIn,
    );

    const destination = response.user.requiresTermsAcceptance
      ? '/terms'
      : '/dashboard/calendar';

    res.redirect(
      HttpStatus.FOUND,
      new URL(
        destination,
        this.config.getOrThrow<string>('auth.frontend.url'),
      ).toString(),
    );
  }
}
