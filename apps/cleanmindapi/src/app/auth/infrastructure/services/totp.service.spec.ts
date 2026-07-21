import { TotpService } from './totp.service';

describe('TotpService', () => {
  const service = new TotpService();
  const rfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

  it.each([
    [59_000, '94287082'],
    [1_111_111_109_000, '07081804'],
    [1_234_567_890_000, '89005924'],
    [2_000_000_000_000, '69279037'],
  ])('matches the RFC 6238 SHA-1 vector at %i', (timestamp, expected) => {
    expect(service.generate(rfcSecret, timestamp, 8)).toBe(expected);
  });

  it('accepts a six-digit code once inside the configured time window', () => {
    const timestamp = 1_700_000_000_000;
    const code = service.generate(rfcSecret, timestamp);

    expect(service.verify(code, rfcSecret, timestamp)).toBe(
      Math.floor(timestamp / 1000 / 30),
    );
    expect(service.verify('invalid', rfcSecret, timestamp)).toBeNull();
  });
});
