import type { TermsStatus } from '../../common/terms-status';

export abstract class TermsPort {
  abstract getStatus(userId: string): Promise<TermsStatus>;
  abstract requiresAcceptance(userId: string): Promise<boolean>;
  abstract acceptCurrent(userId: string): Promise<TermsStatus>;
}
