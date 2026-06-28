import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./api/controllers/auth.controller";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { PrismaService } from "../common/prisma/prisma.service";
import { BcryptService } from "./infrastructure/security/bcrypt.service";
import { JwtTokenService } from "./infrastructure/security/jwt.service";
import { UserRepositoryPort } from "./infrastructure/repositories/user.repository";
import { PasswordHasherPort } from "./application/ports/password-hasher.port";
import { TokenGeneratorPort } from "./application/ports/token-generator.port";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { StringValue } from 'ms'
import { JwtStrategy } from "../common/auth/strategies/jwt.strategy";

@Module({
imports: [
    PassportModule,
    JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
            secret: config.getOrThrow<string>('JWT_SECRET'),
            signOptions: {
                expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as StringValue,
            },
        }),
    }),
],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,

    PrismaUserRepository,
    PrismaService,

    BcryptService,
    JwtStrategy,
    JwtTokenService,

    {
      provide: UserRepositoryPort,
      useExisting: PrismaUserRepository,
    },
    {
      provide: PasswordHasherPort,
      useExisting: BcryptService,
    },
    {
      provide: TokenGeneratorPort,
      useExisting: JwtTokenService,
    },
  ],
})
export class AuthModule {}
