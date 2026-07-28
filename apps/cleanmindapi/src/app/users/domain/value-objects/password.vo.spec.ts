import { Password } from './password.vo';

describe('Password', () => {
  it('rejects passwords shorter than 8 characters in Spanish', () => {
    expect(() => new Password('1234567')).toThrow(
      'La contraseña debe tener al menos 8 caracteres.',
    );
  });

  it('accepts a password with 8 characters', () => {
    expect(new Password('12345678').getValue()).toBe('12345678');
  });
});
