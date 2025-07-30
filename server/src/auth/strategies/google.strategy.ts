import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(cfg: ConfigService) {
    super({
      clientID: cfg.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: cfg.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: cfg.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }
  async validate(_at: string, _rt: string, profile: Profile) {
    const { id, displayName, emails, photos } = profile;
    return {
      provider: 'google',
      providerId: id,
      name: displayName,
      email: emails?.[0]?.value,
      picture: photos?.[0]?.value,
    };
  }
}
