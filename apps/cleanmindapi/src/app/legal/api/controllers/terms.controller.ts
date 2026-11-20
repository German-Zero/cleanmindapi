import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { TermsOptional } from '../../../shared/security/decorators/terms-optional.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { TermsStatus } from '../../application/common/terms-status';
import { TermsPort } from '../../application/ports/inbound/terms.port';

interface TermsStatusResponse extends Omit<TermsStatus, 'effectiveAt'> {
  effectiveAt: string;
}

@Controller('terms')
@UseGuards(JwtAuthGuard)
@TermsOptional()
export class TermsController {
  constructor(private readonly terms: TermsPort) {}

  @Get('current')
  async current(@CurrentUser() user: JwtPayload): Promise<TermsStatusResponse> {
    return this.toResponse(await this.terms.getStatus(user.sub));
  }

  @Post('current/accept')
  async accept(@CurrentUser() user: JwtPayload): Promise<TermsStatusResponse> {
    return this.toResponse(await this.terms.acceptCurrent(user.sub));
  }

  private toResponse(status: TermsStatus): TermsStatusResponse {
    return {
      ...status,
      effectiveAt: status.effectiveAt.toISOString(),
    };
  }
}
