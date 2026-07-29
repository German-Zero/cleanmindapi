import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendBrevoMail {
  to: string;
  subject: string;
  htmlContent: string;
}

@Injectable()
export class BrevoMailService {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly sender: {
    email: string;
    name: string;
  };

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('auth.mail.apiKey');
    this.endpoint = `${config
      .getOrThrow<string>('auth.mail.apiUrl')
      .replace(/\/$/, '')}/smtp/email`;
    this.timeoutMs = config.getOrThrow<number>('auth.mail.timeoutMs');
    this.sender = {
      email: config.getOrThrow<string>('auth.mail.from'),
      name: config.getOrThrow<string>('auth.mail.fromName'),
    };
  }

  async send(mail: SendBrevoMail): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;

    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: this.sender,
          to: [{ email: mail.to }],
          subject: mail.subject,
          htmlContent: mail.htmlContent,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Brevo no respondió dentro de ${this.timeoutMs} ms`);
      }

      throw new Error('No se pudo conectar con Brevo');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const detail = (await response.text()).trim().slice(0, 300);
      throw new Error(
        `Brevo rechazó el correo (${response.status})${
          detail ? `: ${detail}` : ''
        }`,
      );
    }
  }
}
