import { EmailAlreadyExistsException } from './email-already-exists.exception';
import { InvalidCredentialsException } from './invalid-credentials.exception';
import { UserNotFoundException } from './user-not-found.exception';

describe('Auth domain errors', () => {
  it('exposes stable domain codes and Spanish messages', () => {
    const invalidCredentials = new InvalidCredentialsException();
    const duplicatedEmail = new EmailAlreadyExistsException();
    const missingUser = new UserNotFoundException();

    expect(invalidCredentials.code).toBe('INVALID_CREDENTIALS');
    expect(invalidCredentials.message).toBe(
      'El email o la contraseña son incorrectos.',
    );
    expect(duplicatedEmail.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(duplicatedEmail.message).toBe(
      'Ya existe una cuenta con este email.',
    );
    expect(missingUser.code).toBe('USER_NOT_FOUND');
    expect(missingUser.message).toBe('No encontramos el usuario.');
  });
});
