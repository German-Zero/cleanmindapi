import { Global, Module } from "@nestjs/common";
import { HandlebarsService } from './helpers/handlebars.service';
import { TemplateRegistryService } from './helpers/template-registry.service';

@Global()
@Module({
  providers: [TemplateRegistryService, HandlebarsService],
  exports: [HandlebarsService],
})
export class SharedMailModule {}
