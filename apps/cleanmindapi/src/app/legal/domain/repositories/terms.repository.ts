export interface TermsVersionRecord {
  id: string;
  version: string;
  title: string;
  documentUrl: string;
  effectiveAt: Date;
}

export abstract class TermsRepository {
  abstract findCurrent(now: Date): Promise<TermsVersionRecord | null>;
  abstract hasAccepted(userId: string, termsVersionId: string): Promise<boolean>;
  abstract accept(userId: string, termsVersionId: string): Promise<void>;
}
