export abstract class MfaSecretCipherPort {
  abstract encrypt(value: string): string;
  abstract decrypt(value: string): string;
}
