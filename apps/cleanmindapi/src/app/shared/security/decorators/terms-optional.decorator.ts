import { SetMetadata } from '@nestjs/common';

export const TERMS_OPTIONAL_KEY = 'termsOptional';

export const TermsOptional = () => SetMetadata(TERMS_OPTIONAL_KEY, true);
