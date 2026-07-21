import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import Handlebars from 'handlebars';

import { MailTemplate } from '../enums/mail-template.enum';
import { TemplateRegistryService } from './template-registry.service';

export type TemplateContext = Record<string, unknown>;

@Injectable()
export class HandlebarsService {
  private partialsRegistered = false;

  constructor(
    private readonly registry: TemplateRegistryService,
    private readonly config: ConfigService,
  ) {}

  renderEmail(template: MailTemplate, context: TemplateContext): string {
    this.registerPartials();

    const body = this.compile(this.registry.get(template), context);

    return this.compile(this.registry.getLayout(), {
      ...this.sharedContext(),
      ...context,
      body,
    });
  }

  renderChannel(
    channel: 'whatsapp' | 'discord',
    template: MailTemplate,
    context: TemplateContext,
  ): string {
    return this.compile(
      this.registry.getChannelTemplate(channel, template),
      {
        ...this.sharedContext(),
        ...context,
      },
    ).trim();
  }

  private compile(path: string, context: TemplateContext): string {
    const source = readFileSync(path, 'utf8');
    return Handlebars.compile(source, { noEscape: false })(context);
  }

  private registerPartials(): void {
    if (this.partialsRegistered) return;

    for (const partial of ['button', 'footer', 'header', 'styles']) {
      Handlebars.registerPartial(
        partial,
        readFileSync(this.registry.getPartial(partial), 'utf8'),
      );
    }

    this.partialsRegistered = true;
  }

  private sharedContext(): TemplateContext {
    return {
      appName: this.config.get<string>('auth.mail.appName') ?? 'CleanMind',
      supportEmail:
        this.config.get<string>('auth.mail.supportEmail') ?? 'support@cleanmind.app',
      logoUrl: this.config.get<string>('auth.mail.logoUrl'),
      primaryColor: '#7C3AED',
      year: new Date().getFullYear(),
    };
  }
}
