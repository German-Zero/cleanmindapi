import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { StringValue } from "ms";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.accessSecret'),

        signOptions: {
          expiresIn: config.get<string>(
            'auth.accessExpiresIn',
          ) as StringValue,
        },
      }),
    }),
  ],

  exports: [JwtModule],
})
export class JwtConfigModule {}
