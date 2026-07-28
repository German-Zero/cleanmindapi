import { HttpStatus } from '@nestjs/common';
import { EmailAlreadyExistsException } from './email-already-exists.exception';
import { InvalidCredentialsException } from './invalid-credentials.exception';
import { UserNotFoundException } from './user-not-found.exception';

describe('Auth domain errors', () => {
  it('returns the expected HTTP status and Spanish message', () => {
    const invalidCredentials = new InvalidCredentialsException();
    const duplicatedEmail = new EmailAlreadyExistsException();
    const missingUser = new UserNotFoundException();

    expect(invalidCredentials.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(invalidCredentials.message).toBe(
      'El email o la contraseña son incorrectos.',
    );
    expect(duplicatedEmail.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(duplicatedEmail.message).toBe(
      'Ya existe una cuenta con este email.',
    );
    expect(missingUser.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(missingUser.message).toBe('No encontramos el usuario.');
  });
});
