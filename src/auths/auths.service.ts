import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto/create-auth.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

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

  // async socialsignup(signUpData: AuthDto.SocialSignUp): Promise<User> {
  //   const { social_code, external_id, access_token } = signUpData;
  
  //   const newUser = await this.userService.addSocial(
  //     email,
  //     hashedPassword,
  //     name,
  //     salt ?? "salt",
  //     set_profile ?? false,
  //   );
  
  //   return newUser;
  // }

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
}
