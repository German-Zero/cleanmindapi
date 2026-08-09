import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import {
  TermsRepository,
  TermsVersionRecord,
} from '../../domain/repositories/terms.repository';

@Injectable()
export class PrismaTermsRepository implements TermsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCurrent(now: Date): Promise<TermsVersionRecord | null> {
    return this.prisma.termsVersion.findFirst({
      where: { effectiveAt: { lte: now } },
      orderBy: [{ effectiveAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        version: true,
        title: true,
        documentUrl: true,
        effectiveAt: true,
      },
    });
  }

  async hasAccepted(userId: string, termsVersionId: string): Promise<boolean> {
    const acceptance = await this.prisma.userTermsAcceptance.findUnique({
      where: {
        userId_termsVersionId: { userId, termsVersionId },
      },
      select: { userId: true },
    });

    return Boolean(acceptance);
  }

  async accept(userId: string, termsVersionId: string): Promise<void> {
    await this.prisma.userTermsAcceptance.upsert({
      where: {
        userId_termsVersionId: { userId, termsVersionId },
      },
      create: { userId, termsVersionId },
      update: {},
    });
  }
}
