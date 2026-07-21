export type AuthenticationMethod = 'pwd' | 'google' | 'otp';

export interface AuthenticationContext {
  authTime: number;
  methods: AuthenticationMethod[];
}
