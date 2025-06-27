import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { OAuthProfile } from '../interfaces/oauth-profile.interface';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID || 'mock-client-id',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'mock-client-secret',
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3001/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<OAuthProfile> {
    return {
      id: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatar: profile.photos[0]?.value,
      provider: 'linkedin',
    };
  }
}