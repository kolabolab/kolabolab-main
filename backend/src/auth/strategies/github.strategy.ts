import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-github2';
import { OAuthProfile } from '../interfaces/oauth-profile.interface';

@Injectable()
export class GitHubStrategy { // extends PassportStrategy(Strategy, 'github') {
  // constructor() {
  //   super({
  //     clientID: process.env.GITHUB_CLIENT_ID || 'mock-client-id',
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock-client-secret',
  //     callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
  //     scope: ['user:email'],
  //   });
  // }

  // async validate(accessToken: string, refreshToken: string, profile: any): Promise<OAuthProfile> {
  //   return {
  //     id: profile.id,
  //     email: profile.emails[0].value,
  //     firstName: profile.displayName?.split(' ')[0] || profile.username,
  //     lastName: profile.displayName?.split(' ')[1] || '',
  //     avatar: profile.photos[0]?.value,
  //     provider: 'github',
  //   };
  // }
}