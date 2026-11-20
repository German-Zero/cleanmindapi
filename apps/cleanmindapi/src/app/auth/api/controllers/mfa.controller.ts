import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { MfaPort } from '../../application/ports/inbound/mfa.port';
import { MfaSetupResponse, MfaStatusResponse } from '../../application/common/responses/mfa-responses';
import { CookieService } from '../services/cookie.service';
import { JwtPayload } from '../../application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { Public } from '../../../shared/security/decorators/public.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { MfaCodeRequest } from '../requests/mfa-code.request';
import { VerifyMfaLoginRequest } from '../requests/verify-mfa-login.request';
import { AuthApiResponse, AuthApiResponseMapper } from '../mapper/auth-api-response.mapper';
import { PublicAuthRateLimitGuard } from '../guards/public-auth-rate-limit.guard';

@Controller('auth/mfa')
export class MfaController {
  constructor(
    private readonly mfa: MfaPort,
    private readonly cookies: CookieService,
  ) {}

  @Post('verify')
  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @Header('Cache-Control', 'no-store')
  async verifyLogin(
    @Body() request: VerifyMfaLoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthApiResponse> {
    const result = await this.mfa.verifyLogin(
      request.challengeToken,
      request.code,
    );

    this.cookies.setAccessToken(response, result.accessToken, result.expiresIn);
    this.cookies.setRefreshToken(
      response,
      result.refreshToken,
      result.refreshExpiresIn,
    );

    return AuthApiResponseMapper.toResponse(result);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: JwtPayload): Promise<MfaStatusResponse> {
    return this.mfa.status(user.sub);
  }

  @Post('setup')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  setup(@CurrentUser() user: JwtPayload): Promise<MfaSetupResponse> {
    return this.mfa.setup(user.sub, user.authTime);
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  async enable(
    @CurrentUser() user: JwtPayload,
    @Body() request: MfaCodeRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ recoveryCodes: string[] }> {
    const result = {
      recoveryCodes: await this.mfa.enable(user.sub, request.code),
    };
    this.cookies.clearTokens(response);

    return result;
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disable(
    @CurrentUser() user: JwtPayload,
    @Body() request: MfaCodeRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.mfa.disable(user.sub, request.code);
    this.cookies.clearTokens(response);
  }

  @Post('recovery-codes')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  async regenerateRecoveryCodes(
    @CurrentUser() user: JwtPayload,
    @Body() request: MfaCodeRequest,
  ): Promise<{ recoveryCodes: string[] }> {
    return {
      recoveryCodes: await this.mfa.regenerateRecoveryCodes(
        user.sub,
        request.code,
      ),
    };
  }
}
