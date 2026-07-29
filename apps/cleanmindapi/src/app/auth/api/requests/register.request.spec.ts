import { validate } from 'class-validator';
import { RegisterRequest } from './register.request';

describe('RegisterRequest', () => {
  const request = (acceptedTerms: boolean) =>
    Object.assign(new RegisterRequest(), {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password123',
      acceptedTerms,
    });

  it('rechaza el registro sin aceptar los términos', async () => {
    const errors = await validate(request(false));

    expect(
      errors.some((error) => error.property === 'acceptedTerms'),
    ).toBe(true);
  });

  it('acepta el consentimiento explícito', async () => {
    const errors = await validate(request(true));

    expect(
      errors.some((error) => error.property === 'acceptedTerms'),
    ).toBe(false);
  });
});
