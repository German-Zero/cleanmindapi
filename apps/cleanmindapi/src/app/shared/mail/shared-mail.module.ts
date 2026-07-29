import { Global, Module } from '@nestjs/common';
import { HandlebarsService } from './helpers/handlebars.service';
import { TemplateRegistryService } from './helpers/template-registry.service';
import { BrevoMailService } from './brevo-mail.service';

@Global()
@Module({
  providers: [TemplateRegistryService, HandlebarsService, BrevoMailService],
  exports: [HandlebarsService, BrevoMailService],
})
export class SharedMailModule {}
