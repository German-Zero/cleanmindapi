import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Patch, Post, Res, UseGuards } from "@nestjs/common";
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
import { AuthResponse, LoginResponse } from "../response/auth-response";
import { CurrentUserResponse } from "../response/current-user.response";
import { JwtAuthGuard } from "../../../shared/security/guards/jwt-auth.guard";
import { ChangePasswordUseCase } from "../../application/use-cases/change-password.usecase";
import { ChangePasswordRequest } from "../requests/change-password.request";
import { ChangePasswordCommand } from "../../application/commands/change-password.command";
import { SetPasswordRequest } from "../requests/set-password.request";
import { SetPasswordCommand } from "../../application/commands/set-password.command";
import { SetPasswordUseCase } from "../../application/use-cases/set-password.usecase";
import { MfaService, MfaSetupResponse, MfaStatusResponse } from '../../application/services/mfa.service';
import { MfaCodeRequest } from '../requests/mfa-code.request';
import { VerifyMfaLoginRequest } from '../requests/verify-mfa-login.request';
import { ConfigService } from '@nestjs/config';
import { ResendVerificationEmailPort } from "../../application/ports/inbound/resend-verification-email.port";
import { ResendVerificationEmailCommand } from "../../application/commands/resend-verification-email.command";
import { DeleteAccountUseCase } from "../../application/use-cases/delete-account.usecase";
import { CompleteOnboardingUseCase } from '../../application/use-cases/complete-onboarding.usecase';
import { TermsOptional } from '../../../shared/security/decorators/terms-optional.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logoutUser: LogoutUserUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly verifyEmailPort: VerifyEmailPort,
    private readonly resendVerificationEmailPort: ResendVerificationEmailPort,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly loginGoogleUseCase: LoginGoogleUseCase,
    private readonly cookieService: CookieService,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    private readonly mfaService: MfaService,
    private readonly config: ConfigService,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
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
      604800,
    );

    return response;
  }

  @Post('mfa/verify')
  @Public()
  @Header('Cache-Control', 'no-store')
  async verifyMfaLogin(
    @Body() request: VerifyMfaLoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const response = await this.mfaService.verifyLogin(
      request.challengeToken,
      request.code,
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

  @Get('mfa/status')
  @UseGuards(JwtAuthGuard)
  statusMfa(@CurrentUser() user: JwtPayload): Promise<MfaStatusResponse> {
    return this.mfaService.status(user.sub);
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  setupMfa(@CurrentUser() user: JwtPayload): Promise<MfaSetupResponse> {
    return this.mfaService.setup(user.sub, user.authTime);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  async enableMfa(
    @CurrentUser() user: JwtPayload,
    @Body() request: MfaCodeRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ recoveryCodes: string[] }> {
    const result = {
      recoveryCodes: await this.mfaService.enable(user.sub, request.code),
    };
    this.cookieService.clearTokens(res);

    return result;
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableMfa(
    @CurrentUser() user: JwtPayload,
    @Body() request: MfaCodeRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.mfaService.disable(user.sub, request.code);
    this.cookieService.clearTokens(res);
  }

  @Post('mfa/recovery-codes')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  async regenerateMfaRecoveryCodes(
    @CurrentUser() user: JwtPayload,
    @Body() request: MfaCodeRequest,
  ): Promise<{ recoveryCodes: string[] }> {
    return {
      recoveryCodes: await this.mfaService.regenerateRecoveryCodes(
        user.sub,
        request.code,
      ),
    };
  }

  @Post('login')
  @Public()
  @Header('Cache-Control', 'no-store')
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {

    const response =
      await this.loginUserUseCase.execute(
        new LoginUserCommand(
          request.email,
          request.password,
        ),
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
  @TermsOptional()
  @Header('Cache-Control', 'no-store')
  async me(@CurrentUser() user: JwtPayload): Promise<CurrentUserResponse> {
    const currentUser = await this.getCurrentUser.execute(user.sub);
    return CurrentUserMapper.toResponse(currentUser);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @TermsOptional()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.deleteAccountUseCase.execute(user.sub);
    this.cookieService.clearTokens(res);
  }

  @Patch('onboarding/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async completeOnboarding(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.completeOnboardingUseCase.execute(user.sub);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Body() request: VerifyEmailRequest): Promise<void> {
    await this.verifyEmailPort.execute(new VerifyEmailCommand(request.code));
  }

  @Post('resend-verification-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendVerificationEmail(
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.resendVerificationEmailPort.execute(
      new ResendVerificationEmailCommand(user.sub),
    );
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

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() req: ChangePasswordRequest
  ): Promise<void> {
    await this.changePasswordUseCase.execute(
      new ChangePasswordCommand(
        user.sub,
        req.currentPassword,
        req.newPassword,
        req.confirmPassword
      )
    )
  }

  @Patch('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPassword(
    @CurrentUser() user: JwtPayload,
    @Body() req: SetPasswordRequest,
  ): Promise<void> {
    await this.setPasswordUseCase.execute(new SetPasswordCommand(
      user.sub,
      req.password,
      req.confirmPassword,
    ))
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

    const response =
      await this.loginGoogleUseCase.execute(
        new LoginGoogleCommand(
          user.email,
          user.name,
          user.avatarUrl,
        ),
      );

    if ('challengeToken' in response) {
      this.cookieService.clearTokens(res);
      const loginUrl = new URL(
        '/login',
        this.config.getOrThrow<string>('auth.frontend.url'),
      );
      loginUrl.searchParams.set('googleMfaChallenge', response.challengeToken);
      loginUrl.searchParams.set('googleMfaExpiresIn', String(response.expiresIn));
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
      604800,
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
