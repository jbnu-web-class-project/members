import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL"),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('accessToken: ', accessToken);
    console.log('refreshToken: ', refreshToken);
    console.log(profile);

    const email = profile.emails && profile.emails[0]?.value; // 이메일 존재 여부 체크

    if (!email) {
      throw new Error('Google account does not provide an email');
    }

    return {
      email: profile.emails[0].value,
      external_id: profile.id, // 구글의 id는 문자열입니다.
      nickname: profile.name.givenName,
      refresh_token: refreshToken,
      login_type: 1,
    };
  }
}
