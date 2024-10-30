import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('signup')
  async signUp(@Body(new ValidationPipe()) signUpData: AuthDto.SignUp,
  ) {
    const userInfo = await this.authsService.signup(signUpData);

    if (userInfo) {
      return userInfo;
    }

    throw new HttpException(
      { status: HttpStatus.CONFLICT, error: '아이디(이메일)가 이미 존재합니다.' },
      HttpStatus.CONFLICT,
    );
  }


  @Post('signin')
  async signin(@Body(new ValidationPipe()) signInData: AuthDto.SignIn,
  ) {
    const token = await this.authsService.signin(signInData);
    
    if (token) {
      return token;
    }

    throw new HttpException(
      { status: HttpStatus.UNAUTHORIZED, error: '아이디(이메일) 또는 패스워드가 일치하지 않습니다.' },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
