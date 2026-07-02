export class EmailAlreadyExistsException extends Error {
  constructor() {
    super('Email already exists.');
  }
}
