import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

@Injectable()
export class TotpService {
  generateSecret(size = 20): string {
    return this.encodeBase32(randomBytes(size));
  }

  createUri(secret: string, accountName: string, issuer: string): string {
    const label = encodeURIComponent(`${issuer}:${accountName}`);
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30',
    });

    return `otpauth://totp/${label}?${params.toString()}`;
  }

  generate(
    secret: string,
    timestamp = Date.now(),
    digits = 6,
    periodSeconds = 30,
  ): string {
    const counter = Math.floor(timestamp / 1000 / periodSeconds);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    counterBuffer.writeUInt32BE(counter >>> 0, 4);

    const digest = createHmac('sha1', this.decodeBase32(secret))
      .update(counterBuffer)
      .digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = digest.readUInt32BE(offset) & 0x7fffffff;

    return String(binary % 10 ** digits).padStart(digits, '0');
  }

  verify(
    code: string,
    secret: string,
    timestamp = Date.now(),
    window = 1,
  ): number | null {
    if (!/^\d{6}$/.test(code)) return null;

    const currentStep = Math.floor(timestamp / 1000 / 30);

    const offsets = [0];

    for (let distance = 1; distance <= window; distance += 1) {
      offsets.push(-distance, distance);
    }

    for (const offset of offsets) {
      const expected = this.generate(
        secret,
        (currentStep + offset) * 30 * 1000,
      );

      if (timingSafeEqual(Buffer.from(code), Buffer.from(expected))) {
        return currentStep + offset;
      }
    }

    return null;
  }

  private encodeBase32(value: Buffer): string {
    let bits = 0;
    let accumulator = 0;
    let output = '';

    for (const byte of value) {
      accumulator = (accumulator << 8) | byte;
      bits += 8;

      while (bits >= 5) {
        output += BASE32_ALPHABET[(accumulator >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += BASE32_ALPHABET[(accumulator << (5 - bits)) & 31];
    }

    return output;
  }

  private decodeBase32(value: string): Buffer {
    let bits = 0;
    let accumulator = 0;
    const output: number[] = [];

    for (const character of value.replace(/=+$/u, '').toUpperCase()) {
      const index = BASE32_ALPHABET.indexOf(character);

      if (index < 0) throw new Error('Invalid Base32 TOTP secret');

      accumulator = (accumulator << 5) | index;
      bits += 5;

      if (bits >= 8) {
        output.push((accumulator >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}
