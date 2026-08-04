import { Global, Module } from '@nestjs/common';
import { TermsController } from './api/controllers/terms.controller';
import { TermsService } from './application/terms.service';
import { TermsRepository } from './domain/repositories/terms.repository';
import { PrismaTermsRepository } from './infrastructure/repositories/prisma-terms.repository';

@Global()
@Module({
  controllers: [TermsController],
  providers: [
    TermsService,
    PrismaTermsRepository,
    {
      provide: TermsRepository,
      useExisting: PrismaTermsRepository,
    },
  ],
  exports: [TermsService],
})
export class LegalModule {}
