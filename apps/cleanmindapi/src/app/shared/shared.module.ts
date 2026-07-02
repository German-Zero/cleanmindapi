import { Module } from "@nestjs/common";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { JwtStrategy } from "./security/strategies/jwt.strategy";
import { JwtAuthGuard } from "./security/guards/jwt-auth.guard";
import { JwtConfigModule } from "./infrastructure/jwt/jwt.module";
import { CookieService } from "./application/services/cookie.service";

@Module({
  imports: [
    PrismaModule,
    JwtConfigModule,
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    CookieService,
  ],
  exports: [PrismaModule, JwtStrategy, JwtAuthGuard, JwtConfigModule, CookieService],
})
export class SharedModule {}
