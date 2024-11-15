import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/create-auth.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

enum LoginType {
  LOCAL = 0,
  GOOGLE = 1,
  Naver = 2,
  KAKAO = 3,
}

@Injectable()
export class AuthsService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signUpData: AuthDto.SignUp): Promise<User> {
    const { email, password, name, set_profile } = signUpData;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = await this.userService.createUser(
      email,
      hashedPassword,
      name,
      set_profile ?? false,
    );
  
    return newUser;
  }

  async socialLogin(socialLoginData: AuthDto.SocialSignUp): Promise<{ token: string, user: User }> {
    const { email, external_id, nickname, refresh_token, login_type } = socialLoginData;

    // 유저 조회 시 소셜 로그인이 있는지 확인
    let user = await this.userService.findUserBySocial(external_id).catch(() => null);

    // 유저가 없으면 새로 회원가입 처리
    if (!user) {
      user = await this.userService.addSocialLogin( email, external_id, nickname, refresh_token, login_type );
    }

    // JWT 토큰 발급
    const payload = { id: user.user_id, login_type: user.login_type, email };
    const token = this.jwtService.sign(payload);

    return { token, user };
  }

  async signin(signInData: AuthDto.SignIn): Promise<{ token: string, user: User } | null> {
    const { email, password } = signInData;
    let user: User;

    user = await this.userService.findUserByEmail(email);
    
    const userLogin = user.logins.find(login => login.email === email);

    if (!userLogin) {
      throw new Error('No matching login information found');
    }
  
    const isPasswordValid = await bcrypt.compare(password, userLogin.password);
    if (!isPasswordValid) {
      console.log('비밀번호가 일치하지 않습니다.');
      return null;
    }
  
    const payload = { 
      id: user.user_id, 
      login_type: user.login_type,
      email: userLogin.email,
    };
    const token = this.jwtService.sign(payload);
    user.logins = undefined;
  
    console.log('JWT 토큰 생성 성공:', token);
  
    return { token, user } ;
  }  

  // JWT token 인증
  async verifyToken(token: string): Promise<boolean> {
    const jwt_secret = this.configService.get<string>("JWT_SECRET")

    try {
      jwt.verify(token, jwt_secret);
      return true;
    } catch (err) {
      return false;
    }
  }
}
