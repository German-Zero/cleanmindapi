import { ConfigService } from '@nestjs/config';

import { NotificationFactory } from '../../application/factories/notification.factory';
import { Notification } from '../../domain/entities/notification.entity';
import { HandlebarsService } from '../../../shared/mail/helpers/handlebars.service';
import { TemplateRegistryService } from '../../../shared/mail/helpers/template-registry.service';
import { NotificationTemplateService } from './notification-template.service';

describe('NotificationTemplateService', () => {
  const config = new ConfigService({
    auth: {
      mail: {
        appName: 'CleanMind',
        supportEmail: 'support@cleanmind.test',
      },
    },
  });
  const registry = new TemplateRegistryService();
  const handlebars = new HandlebarsService(registry, config);
  const service = new NotificationTemplateService(handlebars);
  const factory = new NotificationFactory();

  const notifications: Notification[] = [
    factory.buildVerifyEmail('user@example.com', 'https://cleanmind.test/verify'),
    factory.buildPasswordReset('user@example.com', 'https://cleanmind.test/reset'),
    factory.buildTaskReminder('user@example.com', 'Preparar entrega', new Date('2026-07-21T15:00:00Z')),
    factory.buildTaskOverdue('user@example.com', 'Pagar servicio', new Date('2026-07-19T15:00:00Z')),
    factory.buildTaskCompleted('user@example.com', 'Ordenar escritorio'),
    factory.buildMotivational('user@example.com', 'Avanzar poco también es avanzar.'),
  ];

  it.each(notifications)('renders every channel for $type', notification => {
    const email = service.renderEmail(notification);
    const whatsapp = service.renderWhatsapp(notification);
    const discord = service.renderDiscord(notification);

    expect(email).toContain('<html');
    expect(email).toContain('CleanMind');
    expect(whatsapp.length).toBeGreaterThan(20);
    expect(discord.length).toBeGreaterThan(20);
    expect(email + whatsapp + discord).not.toContain('{{');
  });
});
