export abstract class TotpPort {
  abstract generateSecret(): string;
  abstract createUri(
    secret: string,
    accountName: string,
    issuer: string,
  ): string;
  abstract verify(code: string, secret: string): number | null;
}
