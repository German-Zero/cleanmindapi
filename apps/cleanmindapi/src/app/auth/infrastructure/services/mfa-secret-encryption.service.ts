import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class MfaSecretEncryptionService {
  constructor(private readonly config: ConfigService) {}

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [
      'v1',
      iv.toString('base64url'),
      tag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join('.');
  }

  decrypt(value: string): string {
    const [version, ivValue, tagValue, encryptedValue] = value.split('.');

    if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) {
      throw new Error('Invalid encrypted MFA secret');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(ivValue, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private get key(): Buffer {
    const encoded = this.config.getOrThrow<string>('auth.mfa.encryptionKey');
    const key = Buffer.from(encoded, 'base64');

    if (key.length !== 32) {
      throw new Error('MFA_ENCRYPTION_KEY must be a Base64-encoded 32-byte key');
    }

    return key;
  }
}
