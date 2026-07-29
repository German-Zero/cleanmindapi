export abstract class DeleteAccountPort {
  abstract execute(userId: string): Promise<void>;
}
