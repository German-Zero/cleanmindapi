import { TokenGeneratorService } from './token-generator.service';

describe('TokenGeneratorService', () => {
  const generator = new TokenGeneratorService();

  it('generates a six-digit verification code by default', () => {
    const code = generator.generate();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('generates a URL-safe token for password recovery', () => {
    const token = generator.generate(32);
    expect(token).not.toBe(generator.generate(32));
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(43);
  });
});
