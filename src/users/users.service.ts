import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-user.dto';
import { AuthLogin, AuthSocialLogin } from 'src/auths/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

enum LoginType {
  LOCAL = 0,
  GOOGLE = 1,
  Naver = 2,
  KAKAO = 3,
}

enum RoleType {
  ADMIN = 0,
  USER = 1,
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(AuthLogin) private readonly authLoginRepository: Repository<AuthLogin>,
    @InjectRepository(AuthSocialLogin) private readonly authSocialLoginRepository: Repository<AuthSocialLogin>,
    private dataSource: DataSource,
  ) {}
  
  async createUser(
    email: string,
    password: string,
    name: string,
    set_profile: boolean,
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new User();
      user.name = name;
      user.role = RoleType.USER;
      user.login_type = LoginType.LOCAL;
      user.set_profile = set_profile;

      const login = new AuthLogin();
      login.email = email;
      login.password = password;
      login.user = user; // AuthLogin의 user 필드에 User 객체 할당

      user.logins = [login]; // User의 logins 필드에 AuthLogin 객체 할당
      
      const savedUser = await queryRunner.manager.save(User, user);
      savedUser.logins = undefined;

      await queryRunner.commitTransaction();
      return savedUser;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async addSocialLogin(
    externalId: string, 
    socialCode: string, 
    email: string
  ): Promise<User> {
    const existingUser = await this.findUserByEmail(email).catch(() => null);

    const socialLogin = await this.authSocialLoginRepository.findOne({ where: { external_id: externalId, social_code: socialCode } });

    if (existingUser) {
      // 기존 사용자에게 소셜 로그인 추가
      if (socialLogin) {
        throw new ConflictException('Social login already exists for this user');
      }

      const newSocialLogin = new AuthSocialLogin();
      newSocialLogin.external_id = externalId;
      newSocialLogin.social_code = socialCode;
      newSocialLogin.user = existingUser;

      await this.authSocialLoginRepository.save(newSocialLogin);
      return existingUser;
    } else {
      // 새로운 사용자 계정 생성
      const newUser = await this.createUser(
        email,
        '', // 비밀번호는 필요 없음
        email, // 이름은 이메일 또는 다른 값으로 설정
        false // 프로필 설정은 필요 없을 수 있음
      );

      const newSocialLogin = new AuthSocialLogin();
      newSocialLogin.external_id = externalId;
      newSocialLogin.social_code = socialCode;
      newSocialLogin.user = newUser;

      await this.authSocialLoginRepository.save(newSocialLogin);
      return newUser;
    }
  }

  async updateProfile(id: number, updateUserDto: UpdateProfileDto) {
    return `This action updates a #${id} user`;
  }

  // 일반 로그인 유저 조회
  async findUserByEmail(email: string): Promise<User> {
    const login = await this.authLoginRepository.findOne({ where: { email }, relations: ['user'] });
    if (!login) {
      throw new NotFoundException('User with this email does not exist');
    }

    const user = await this.userRepository.findOne({ 
      where: { user_id: login.user.user_id },
      relations: ['logins']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // 소셜 로그인 유저 조회
  async findUserBySocial(externalId: string, socialCode: string): Promise<User> {
    const socialLogin = await this.authSocialLoginRepository.findOne({ where: { external_id: externalId, social_code: socialCode } });
    if (!socialLogin) {
      throw new NotFoundException('Social user not found');
    }

    const user = await this.userRepository.findOne({ where: { user_id: socialLogin.user.user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
