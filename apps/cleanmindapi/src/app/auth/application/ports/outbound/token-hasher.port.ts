export abstract class TokenHasherPort {
  abstract hash(token: string): Promise<string>
  abstract compare(token: string, hash: string): Promise<boolean>
}
