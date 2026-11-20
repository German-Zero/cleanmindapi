import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module';
import { TermsController } from './api/controllers/terms.controller';
import { TermsService } from './application/terms.service';
import { TermsRepository } from './domain/repositories/terms.repository';
import { PrismaTermsRepository } from './infrastructure/repositories/prisma-terms.repository';
import { TermsPort } from './application/ports/inbound/terms.port';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [TermsController],
  providers: [
    TermsService,
    {
      provide: TermsPort,
      useExisting: TermsService,
    },
    PrismaTermsRepository,
    {
      provide: TermsRepository,
      useExisting: PrismaTermsRepository,
    },
  ],
  exports: [TermsPort],
})
export class LegalModule {}
