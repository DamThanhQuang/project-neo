import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, StrategyOptions } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    } as StrategyOptions); 
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { id, displayName, emails, photos } = profile;

    return {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value,
      name: displayName,
      avatar: photos?.[0]?.value,
    };
  }
}
