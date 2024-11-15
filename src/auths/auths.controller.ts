import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ValidationPipe, UseGuards, Res, Req } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthDto } from './dto/create-auth.dto';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';
import { JWTAuthGuard } from './guard/jwt-auth.guard';
import { UpdateProfileDto } from '../users/dto/update-user.dto';
import { CustomRequest } from 'src/common/interfaces/custom-request.interface';

@Controller('auth')
export class AuthsController {
  constructor(
    private readonly authsService: AuthsService,
    private readonly userService: UsersService,
  ) {}

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

  @Get('signin/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Google 로그인 시작
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request & { user: AuthDto.SocialSignUp },
    @Res({ passthrough: true }) res: Response,
  ) {
    const socialUser = req.user;

    // 소셜 로그인 처리 (자동 회원가입 포함)
    const { token, user } = await this.authsService.socialLogin(socialUser);

    if (token) {
      // 쿠키에 토큰 설정
      res.cookie('accessToken', token, { httpOnly: true, sameSite: 'lax', secure: false });

      // 프로필 설정 여부에 따라 리다이렉트
      if (user.set_profile) {
        // 프로필 설정이 완료된 경우 홈 페이지로 리다이렉트
        res.redirect('http://heim.hwys.xyz/');
      } else {
        // 프로필 설정이 안 된 경우 프로필 설정 페이지로 리다이렉트
        res.redirect('http://heim.hwys.xyz/profile');
      }

      return token;
    }

    throw new HttpException(
      { status: HttpStatus.UNAUTHORIZED, error: '아이디(이메일) 또는 패스워드가 일치하지 않습니다.' },
      HttpStatus.UNAUTHORIZED,
    );
  }


  @Post('signin')
  async signin(
    @Body(new ValidationPipe()) signInData: AuthDto.SignIn,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authsService.signin(signInData);
    
    if (token) {
      res.cookie('accessToken', token, { httpOnly: true, sameSite: 'lax', secure: false });

      return { token, user };
    }

    throw new HttpException(
      { status: HttpStatus.UNAUTHORIZED, error: '아이디(이메일) 또는 패스워드가 일치하지 않습니다.' },
      HttpStatus.UNAUTHORIZED,
    );
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // 쿠키에서 accessToken 삭제
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'lax', secure: false });

    return { message: '로그아웃되었습니다.' };
  }

  @Post('setProfile')
  @UseGuards(JWTAuthGuard)
  async updateProfile(
    @Body() profileData: UpdateProfileDto, // 클라이언트에서 받은 프로필 업데이트 데이터
    @Req() req: CustomRequest, // 요청에 포함된 유저 정보 (토큰으로 유저 정보 확인)
    @Res() res: Response,
  ) {
    const userId = req.user?.user_id; // 토큰에서 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).json({ error: '사용자 인증 정보가 없습니다.' });
    }

    try {
      const updatedProfile = await this.userService.updateProfile(userId, profileData);
      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      return res.status(500).json({ error: '프로필 업데이트에 실패했습니다.' });
    }
  }

  @Get('status')
  async getStatus(@Req() req: Request) {

    try {
      // 토큰이 존재하는지 체크 (쿠키에서)
      const token = req.cookies['accessToken'];
      console.log(req.cookies['accessToken'])

      if (token) {
        // 토큰을 확인하여 유효한지 체크
        const isValid = await this.authsService.verifyToken(token);
        return { loggedIn: isValid };
      }

      return { loggedIn: false };
    } catch (error) {
      // 에러 발생 시 로그인 상태가 아님
      return { loggedIn: false };
    }
  }
}
