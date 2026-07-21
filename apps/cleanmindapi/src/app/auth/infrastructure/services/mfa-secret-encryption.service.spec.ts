import { ConfigService } from '@nestjs/config';

import { MfaSecretEncryptionService } from './mfa-secret-encryption.service';

describe('MfaSecretEncryptionService', () => {
  it('encrypts and authenticates the TOTP secret', () => {
    const config = new ConfigService({
      auth: { mfa: { encryptionKey: Buffer.alloc(32, 7).toString('base64') } },
    });
    const service = new MfaSecretEncryptionService(config);
    const encrypted = service.encrypt('BASE32SECRET');

    expect(encrypted).not.toContain('BASE32SECRET');
    expect(service.decrypt(encrypted)).toBe('BASE32SECRET');
  });

  it('rejects keys that are not exactly 32 bytes', () => {
    const config = new ConfigService({
      auth: { mfa: { encryptionKey: Buffer.alloc(16).toString('base64') } },
    });
    const service = new MfaSecretEncryptionService(config);

    expect(() => service.encrypt('secret')).toThrow(
      'MFA_ENCRYPTION_KEY must be a Base64-encoded 32-byte key',
    );
  });
});
