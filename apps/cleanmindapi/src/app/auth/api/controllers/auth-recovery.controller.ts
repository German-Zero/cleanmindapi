import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { VerifyEmailPort } from '../../application/ports/inbound/verify-email.port';
import { ResendVerificationEmailPort } from '../../application/ports/inbound/resend-verification-email.port';
import { ForgotPasswordPort } from '../../application/ports/inbound/forgot-password.port';
import { ResetPasswordPort } from '../../application/ports/inbound/reset-password.port';
import { VerifyEmailCommand } from '../../application/commands/verify-email.command';
import { ResendVerificationEmailCommand } from '../../application/commands/resend-verification-email.command';
import { ForgotPasswordCommand } from '../../application/commands/forgot-password.command';
import { ResetPasswordCommand } from '../../application/commands/reset-password.command';
import { VerifyEmailRequest } from '../requests/verify-email.request';
import { ForgotPasswordRequest } from '../requests/forgot-password.request';
import { ResetPasswordRequest } from '../requests/reset-password.request';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtPayload } from '../../application/common/jwt-payload';
import { Public } from '../../../shared/security/decorators/public.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { PublicAuthRateLimitGuard } from '../guards/public-auth-rate-limit.guard';

@Controller('auth')
export class AuthRecoveryController {
  constructor(
    private readonly verifyEmail: VerifyEmailPort,
    private readonly resendVerificationEmail: ResendVerificationEmailPort,
    private readonly forgotPassword: ForgotPasswordPort,
    private readonly resetPassword: ResetPasswordPort,
  ) {}

  @Post('verify-email')
  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  verify(@Body() request: VerifyEmailRequest): Promise<void> {
    return this.verifyEmail.execute(new VerifyEmailCommand(request.code));
  }

  @Post('resend-verification-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  resend(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.resendVerificationEmail.execute(
      new ResendVerificationEmailCommand(user.sub),
    );
  }

  @Post('forgot-password')
  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  forgot(@Body() request: ForgotPasswordRequest): Promise<void> {
    return this.forgotPassword.execute(
      new ForgotPasswordCommand(request.email),
    );
  }

  @Post('reset-password')
  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  reset(@Body() request: ResetPasswordRequest): Promise<void> {
    return this.resetPassword.execute(
      new ResetPasswordCommand(request.token, request.password),
    );
  }
}
