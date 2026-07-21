import { Injectable } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { MailTemplate } from '../enums/mail-template.enum';

@Injectable()
export class TemplateRegistryService {
  private readonly mailPath = this.resolveMailPath();
  private readonly templatesPath = join(this.mailPath, 'templates');

  get(template: MailTemplate): string {
    return join(
      this.templatesPath,
      `${template}.hbs`,
    );
  }

  getLayout(name = 'base'): string {
    return join(this.mailPath, 'layouts', `${name}.hbs`);
  }

  getPartial(name: string): string {
    return join(this.mailPath, 'partials', `${name}.hbs`);
  }

  getChannelTemplate(
    channel: 'whatsapp' | 'discord',
    template: MailTemplate,
  ): string {
    return join(this.templatesPath, channel, `${template}.hbs`);
  }

  private resolveMailPath(): string {
    const candidates = [
      join(__dirname, '..'),
      join(__dirname, 'app', 'shared', 'mail'),
      join(process.cwd(), 'apps', 'cleanmindapi', 'src', 'app', 'shared', 'mail'),
      join(process.cwd(), 'src', 'app', 'shared', 'mail'),
    ];

    const resolved = candidates.find(candidate =>
      existsSync(join(candidate, 'layouts', 'base.hbs')),
    );

    if (!resolved) {
      throw new Error('Could not locate Handlebars notification templates.');
    }

    return resolved;
  }
}
