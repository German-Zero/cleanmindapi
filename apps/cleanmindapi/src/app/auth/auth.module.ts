import { Module } from "@nestjs/common";

import { JwtModule } from "@nestjs/jwt";
import { MailModule } from "../shared/infrastructure/mail/mail.module";
import { PrismaModule } from "../shared/infrastructure/prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { SettingsModule } from "../settings/settings.module";
import { ConfigService } from "@nestjs/config";

import { AuthController } from "./api/controllers/auth.controller";

import { LoginUserUseCase } from "./application/use-cases/login-user.usecase";
import { RegisterUserUseCase } from "./application/use-cases/register-user.usecase";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.usecase";
import { LogoutUserUseCase } from "./application/use-cases/logout-user.usecase";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.usecase";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.usecase";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.usecase";
import { LoginGoogleUseCase } from "./application/use-cases/login-google.usecase";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.usecase";
import { ChangePasswordUseCase } from "./application/use-cases/change-password.usecase";
import { SetPasswordUseCase } from "./application/use-cases/set-password.usecase";
import { ResendVerificationEmailUseCase } from "./application/use-cases/resend-verification-email.usecase";
import { DeleteAccountUseCase } from "./application/use-cases/delete-account.usecase";

import { PrismaUserRepository } from "../users/infrastructure/repositories/prisma-user.repository";
import { PrismaRefreshTokenRepository } from "./infrastructure/prisma/repositories/prisma-refresh-token.repository";
import { PrismaVerificationTokenRepository } from "./infrastructure/prisma/repositories/prisma-verification-token.repository";
import { PrismaPasswordResetTokenRepository } from "./infrastructure/prisma/repositories/prisma-password-reset-token.repository";
import { PrismaMfaRepository } from './infrastructure/prisma/repositories/prisma-mfa.repository';


import { BcryptPasswordHasherService } from "./infrastructure/services/bcrypt-password-hasher.service";
import { TokenGeneratorService } from "./infrastructure/services/token-generator.service";
import { RefreshTokenValidationService } from "./domain/services/refresh-token-validation.service";
import { JwtServiceService } from "./infrastructure/services/jwt.service";
import { Sha256TokenHasherService } from "./infrastructure/services/sha256-token-hasher.service";
import { ResendMailAdapter } from "../shared/infrastructure/mail/email-resend.adapter";

import { ResetPasswordPort } from "./application/ports/inbound/reset-password.port";
import { LogoutPort } from "./application/ports/inbound/logout.port";
import { RefreshTokenPort } from "./application/ports/inbound/refresh-token.port";
import { RegisterUserPort } from "./application/ports/inbound/register-user.port";
import { GetCurrentUserPort } from "./application/ports/inbound/get-current-user.port";
import { LoginUserPort } from "./application/ports/inbound/login-user.port";
import { LoginGooglePort } from "./application/ports/inbound/login-google.port";
import { TokenHasherPort } from "./application/ports/outbound/token-hasher.port";
import { PasswordHasherPort } from "./application/ports/outbound/password-hasher.port";
import { TokenGeneratorPort } from "./application/ports/outbound/token-generator.port";
import { JwtPort } from "./application/ports/outbound/jwt.port";
import { MailPort } from "./application/ports/outbound/mail.port";
import { ForgotPasswordPort } from "./application/ports/inbound/forgot-password.port";
import { VerifyEmailPort } from "./application/ports/inbound/verify-email.port";
import { ChangePasswordPort } from "./application/ports/inbound/change-password.port";
import { SetPasswordPort } from "./application/ports/inbound/set-password.port";
import { ResendVerificationEmailPort } from "./application/ports/inbound/resend-verification-email.port";
import { DeleteAccountPort } from "./application/ports/inbound/delete-account.port";

import { UserRepository } from "../users/domain/repositories/user.repository";
import { RefreshTokenRepository } from "./domain/repositories/refresh-token.repository";
import { PasswordResetTokenRepository } from "./domain/repositories/password-reset-token.repository";
import { VerificationTokenRepository } from "./domain/repositories/verification-token.repository";
import { GoogleAuthGuard } from "./api/guards/google-auth.guard";
import { GoogleStrategy } from "./infrastructure/strategies/google.strategy";
import { CookieService } from "../shared/application/services/cookie.service";
import { MfaRepository } from './domain/repositories/mfa.repository';
import { MfaService } from './application/services/mfa.service';
import { SessionIssuerService } from './application/services/session-issuer.service';
import { TotpService } from './infrastructure/services/totp.service';
import { MfaSecretEncryptionService } from './infrastructure/services/mfa-secret-encryption.service';


@Module({
  imports: [
    UsersModule,
    PrismaModule,
    MailModule,
    SettingsModule,
    JwtModule.registerAsync({
        inject: [ConfigService],

        useFactory: (config: ConfigService) => ({
            secret: config.get('auth.accessSecret'),

            signOptions: {
                expiresIn: config.get('auth.accessExpiresIn'),
            },
        }),
    })
  ],

  controllers: [
    AuthController,
  ],

  providers: [

    GoogleAuthGuard,
    GoogleStrategy,

    // Use-Cases

    DeleteAccountUseCase,
    {
      provide: DeleteAccountPort,
      useExisting: DeleteAccountUseCase,
    },

    SetPasswordUseCase,
    {
      provide: SetPasswordPort,
      useExisting: SetPasswordUseCase,
    },

    ChangePasswordUseCase,
    {
      provide: ChangePasswordPort,
      useExisting: ChangePasswordUseCase,
    },

    LoginGoogleUseCase,
    {
      provide: LoginGooglePort,
      useExisting: LoginGoogleUseCase,
    },

    LoginUserUseCase,
    {
      provide: LoginUserPort,
      useExisting: LoginUserUseCase,
    },

    GetCurrentUserUseCase,
    {
      provide: GetCurrentUserPort,
      useExisting: GetCurrentUserUseCase,
    },

    RegisterUserUseCase,
    {
      provide: RegisterUserPort,
      useExisting: RegisterUserUseCase,
    },

    RefreshTokenUseCase,
    {
      provide: RefreshTokenPort,
      useExisting: RefreshTokenUseCase,
    },

    LogoutUserUseCase,
    {
      provide: LogoutPort,
      useExisting: LogoutUserUseCase
    },

    ResetPasswordUseCase,
    {
      provide: ResetPasswordPort,
      useExisting: ResetPasswordUseCase,
    },

    ForgotPasswordUseCase,
    {
      provide: ForgotPasswordPort,
      useExisting: ForgotPasswordUseCase,
    },

    VerifyEmailUseCase,
    {
      provide: VerifyEmailPort,
      useExisting: VerifyEmailUseCase,
    },

    ResendVerificationEmailUseCase,
    {
      provide: ResendVerificationEmailPort,
      useExisting: ResendVerificationEmailUseCase,
    },

    // Repositories


    PrismaUserRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUserRepository,
    },

    PrismaRefreshTokenRepository,
    {
      provide: RefreshTokenRepository,
      useExisting: PrismaRefreshTokenRepository,
    },

    PrismaPasswordResetTokenRepository,
    {
      provide: PasswordResetTokenRepository,
      useExisting: PrismaPasswordResetTokenRepository,
    },

    PrismaVerificationTokenRepository,
    {
      provide: VerificationTokenRepository,
      useExisting: PrismaVerificationTokenRepository,
    },

    PrismaMfaRepository,
    {
      provide: MfaRepository,
      useExisting: PrismaMfaRepository,
    },

    // Services


    Sha256TokenHasherService,
    {
      provide: TokenHasherPort,
      useExisting: Sha256TokenHasherService,
    },

    BcryptPasswordHasherService,
    {
      provide: PasswordHasherPort,
      useExisting: BcryptPasswordHasherService,
    },

    TokenGeneratorService,
    {
      provide: TokenGeneratorPort,
      useExisting: TokenGeneratorService,
    },

    RefreshTokenValidationService,
    CookieService,
    TotpService,
    MfaSecretEncryptionService,
    SessionIssuerService,
    MfaService,

    // Adapters

    JwtServiceService,
    {
      provide: JwtPort,
      useExisting: JwtServiceService,
    },

    ResendMailAdapter,
    {
      provide: MailPort,
      useExisting: ResendMailAdapter,
    },
  ],
  exports: []
})
export class AuthModule {}
