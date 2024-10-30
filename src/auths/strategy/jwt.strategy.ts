import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { User } from "../../users/entities/user.entity";
import { UsersService } from "../../users/users.service";
import { ConfigService } from '@nestjs/config';

enum LoginType {
  LOCAL = 0,
  GOOGLE = 1,
  Naver = 2,
  KAKAO = 3,
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
    ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(payload: Payload, done: VerifiedCallback): Promise<User> {
    const { id, login_type, email} = payload
    let user: User

    if (login_type === LoginType.LOCAL){
      user = await this.userService.findUserByEmail(email);
    }
    else {
      throw new UnauthorizedException({ message: '회원 존재하지 않음.' });
    }
    
    if (!user || user.login_type !== login_type) {
      throw new UnauthorizedException({ message: '회원 존재하지 않음.' });
    }

    return user;
  }
}

export interface Payload {
  id: number;
  login_type: number;
  email: string;
}