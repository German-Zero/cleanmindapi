import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Patch, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GetCurrentUserPort } from '../../application/ports/inbound/get-current-user.port';
import { DeleteAccountPort } from '../../application/ports/inbound/delete-account.port';
import { CompleteOnboardingPort } from '../../application/ports/inbound/complete-onboarding.port';
import { ChangePasswordPort } from '../../application/ports/inbound/change-password.port';
import { SetPasswordPort } from '../../application/ports/inbound/set-password.port';
import { ChangePasswordCommand } from '../../application/commands/change-password.command';
import { SetPasswordCommand } from '../../application/commands/set-password.command';
import { ChangePasswordRequest } from '../requests/change-password.request';
import { SetPasswordRequest } from '../requests/set-password.request';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtPayload } from '../../application/common/jwt-payload';
import { CurrentUserMapper } from '../mapper/current-user.mapper';
import { CurrentUserResponse } from '../../application/common/responses/current-user.response';
import { CookieService } from '../services/cookie.service';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { TermsOptional } from '../../../shared/security/decorators/terms-optional.decorator';

@Controller('auth')
export class AuthAccountController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserPort,
    private readonly deleteAccount: DeleteAccountPort,
    private readonly completeOnboarding: CompleteOnboardingPort,
    private readonly changePassword: ChangePasswordPort,
    private readonly setPassword: SetPasswordPort,
    private readonly cookies: CookieService,
  ) {}

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
  async removeAccount(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.deleteAccount.execute(user.sub);
    this.cookies.clearTokens(response);
  }

  @Patch('onboarding/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  complete(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.completeOnboarding.execute(user.sub);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  change(
    @CurrentUser() user: JwtPayload,
    @Body() request: ChangePasswordRequest,
  ): Promise<void> {
    return this.changePassword.execute(
      new ChangePasswordCommand(
        user.sub,
        request.currentPassword,
        request.newPassword,
        request.confirmPassword,
      ),
    );
  }

  @Patch('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  set(
    @CurrentUser() user: JwtPayload,
    @Body() request: SetPasswordRequest,
  ): Promise<void> {
    return this.setPassword.execute(
      new SetPasswordCommand(
        user.sub,
        request.password,
        request.confirmPassword,
      ),
    );
  }
}
