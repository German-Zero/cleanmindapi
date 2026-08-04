import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { TermsRepository } from '../domain/repositories/terms.repository';

export interface TermsStatus {
  version: string;
  title: string;
  documentUrl: string;
  effectiveAt: Date;
  accepted: boolean;
}

@Injectable()
export class TermsService {
  constructor(private readonly terms: TermsRepository) {}

  async getStatus(userId: string): Promise<TermsStatus> {
    const current = await this.terms.findCurrent(new Date());

    if (!current) {
      throw new ServiceUnavailableException(
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
      throw new ServiceUnavailableException(
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
