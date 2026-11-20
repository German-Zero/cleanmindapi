export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
}

export interface MfaStatusResponse {
  enabled: boolean;
  enabledAt: Date | null;
}
