import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { MfaAuthenticatorRecord, MfaChallengeRecord } from '../../../domain/models/mfa.model';
import { MfaRepository } from '../../../domain/repositories/mfa.repository';

@Injectable()
export class PrismaMfaRepository implements MfaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAuthenticator(userId: string): Promise<MfaAuthenticatorRecord | null> {
    return this.prisma.mfaAuthenticator.findUnique({ where: { userId } });
  }

  async upsertPendingAuthenticator(
    userId: string,
    secretEncrypted: string,
  ): Promise<MfaAuthenticatorRecord> {
    return this.prisma.mfaAuthenticator.upsert({
      where: { userId },
      create: { userId, secretEncrypted },
      update: {
        secretEncrypted,
        enabledAt: null,
        lastUsedStep: null,
        recoveryCodes: { deleteMany: {} },
      },
    });
  }

  async enableAuthenticator(
    authenticatorId: string,
    recoveryCodeHashes: string[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mfaRecoveryCode.deleteMany({ where: { authenticatorId } }),
      this.prisma.mfaRecoveryCode.createMany({
        data: recoveryCodeHashes.map(codeHash => ({ authenticatorId, codeHash })),
      }),
      this.prisma.mfaAuthenticator.update({
        where: { id: authenticatorId },
        data: { enabledAt: new Date() },
      }),
    ]);
  }

  async deleteAuthenticator(userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mfaChallenge.deleteMany({ where: { userId } }),
      this.prisma.mfaAuthenticator.deleteMany({ where: { userId } }),
    ]);
  }

  async replaceRecoveryCodes(
    authenticatorId: string,
    recoveryCodeHashes: string[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mfaRecoveryCode.deleteMany({ where: { authenticatorId } }),
      this.prisma.mfaRecoveryCode.createMany({
        data: recoveryCodeHashes.map(codeHash => ({ authenticatorId, codeHash })),
      }),
    ]);
  }

  async consumeRecoveryCode(
    authenticatorId: string,
    codeHash: string,
  ): Promise<boolean> {
    const result = await this.prisma.mfaRecoveryCode.updateMany({
      where: { authenticatorId, codeHash, usedAt: null },
      data: { usedAt: new Date() },
    });

    return result.count === 1;
  }

  async useTotpStep(authenticatorId: string, step: number): Promise<boolean> {
    const result = await this.prisma.mfaAuthenticator.updateMany({
      where: {
        id: authenticatorId,
        OR: [{ lastUsedStep: null }, { lastUsedStep: { lt: step } }],
      },
      data: { lastUsedStep: step },
    });

    return result.count === 1;
  }

  async createChallenge(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    primaryMethod: 'pwd' | 'google',
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mfaChallenge.deleteMany({ where: { userId } }),
      this.prisma.mfaChallenge.create({
        data: { userId, tokenHash, expiresAt, primaryMethod },
      }),
    ]);
  }

  async claimChallengeAttempt(
    tokenHash: string,
    maxAttempts: number,
  ): Promise<MfaChallengeRecord | null> {
    const claimed = await this.prisma.mfaChallenge.updateMany({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: maxAttempts },
      },
      data: { attempts: { increment: 1 } },
    });

    if (claimed.count !== 1) return null;

    const challenge = await this.prisma.mfaChallenge.findUnique({
      where: { tokenHash },
    });

    if (!challenge) return null;

    if (
      challenge.primaryMethod !== 'pwd' &&
      challenge.primaryMethod !== 'google'
    ) {
      throw new Error('Invalid MFA primary authentication method');
    }

    return {
      ...challenge,
      primaryMethod: challenge.primaryMethod,
    };
  }

  async consumeChallenge(challengeId: string): Promise<boolean> {
    const result = await this.prisma.mfaChallenge.updateMany({
      where: { id: challengeId, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    return result.count === 1;
  }
}
