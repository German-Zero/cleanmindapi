import { ConfigService } from '@nestjs/config';
import { BrevoMailService } from './brevo-mail.service';

describe('BrevoMailService', () => {
  const configValues: Record<string, string | number> = {
    'auth.mail.apiKey': 'brevo-test-key',
    'auth.mail.apiUrl': 'https://api.brevo.test/v3',
    'auth.mail.timeoutMs': 5000,
    'auth.mail.from': 'sender@example.com',
    'auth.mail.fromName': 'CleanMind',
  };

  const config = {
    getOrThrow: jest.fn((key: string) => {
      const value = configValues[key];
      if (value === undefined) {
        throw new Error(`Missing config: ${key}`);
      }

      return value;
    }),
  } as unknown as ConfigService;

  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('sends a transactional email through Brevo', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
    });
    const service = new BrevoMailService(config);

    await service.send({
      to: 'user@example.com',
      subject: 'Confirma tu correo',
      htmlContent: '<p>123456</p>',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.brevo.test/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': 'brevo-test-key',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            email: 'sender@example.com',
            name: 'CleanMind',
          },
          to: [{ email: 'user@example.com' }],
          subject: 'Confirma tu correo',
          htmlContent: '<p>123456</p>',
        }),
      }),
    );
  });

  it('reports a rejected email without hiding the provider response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('Invalid sender'),
    });
    const service = new BrevoMailService(config);

    await expect(
      service.send({
        to: 'user@example.com',
        subject: 'Prueba',
        htmlContent: '<p>Prueba</p>',
      }),
    ).rejects.toThrow('Brevo rechazó el correo (400): Invalid sender');
  });
});
