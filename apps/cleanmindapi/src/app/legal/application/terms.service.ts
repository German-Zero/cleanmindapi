import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../shared/application/errors/application-error';
import { TermsRepository } from '../domain/repositories/terms.repository';
import { TermsPort } from './ports/inbound/terms.port';
import { TermsStatus } from './common/terms-status';

@Injectable()
export class TermsService implements TermsPort {
  constructor(private readonly terms: TermsRepository) {}

  async getStatus(userId: string): Promise<TermsStatus> {
    const current = await this.terms.findCurrent(new Date());

    if (!current) {
      throw new ApplicationError(
        'TERMS_UNAVAILABLE',
        'No hay una versión vigente de los términos.',
      );
    }

    return {
      version: current.version,
      title: current.title,
      documentUrl: current.documentUrl,
      effectiveAt: current.effectiveAt,
      accepted: await this.terms.hasAccepted(userId, current.id),
    };
  }

  async requiresAcceptance(userId: string): Promise<boolean> {
    return !(await this.getStatus(userId)).accepted;
  }

  async acceptCurrent(userId: string): Promise<TermsStatus> {
    const current = await this.terms.findCurrent(new Date());

    if (!current) {
      throw new ApplicationError(
        'TERMS_UNAVAILABLE',
        'No hay una versión vigente de los términos.',
      );
    }

    await this.terms.accept(userId, current.id);

    return {
      version: current.version,
      title: current.title,
      documentUrl: current.documentUrl,
      effectiveAt: current.effectiveAt,
      accepted: true,
    };
  }
}
