import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { GoogleUser } from "../../application/common/google-user";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    private readonly config: ConfigService,
  ) {
    super({
      clientID: config.get<string>('auth.google.clientId')!,
      clientSecret: config.get<string>('auth.google.clientSecret')!,
      callbackURL: config.get<string>('auth.google.callbackUrl')!,
      scope: ['email', 'profile']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(
        new UnauthorizedException(
          'Google account has no email.',
        ),
        false,
      );
    }

    const user: GoogleUser = {
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };

    done(null, user);
  }
}
