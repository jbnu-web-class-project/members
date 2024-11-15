import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-user.dto';
import { AuthLogin, AuthSocialLogin } from 'src/auths/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user_profile.entity';

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
    @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
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
    email: string,
    externalId: string, 
    name: string,
    refreshToken: string,
    loginType: LoginType,
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.findUserByEmail(email).catch(() => null);

      const socialLogin = await this.authSocialLoginRepository.findOne({ where: { external_id: externalId } });

      if (existingUser) {
        // 기존 사용자에게 소셜 로그인 추가
        if (socialLogin) {
          throw new ConflictException('Social login already exists for this user');
        }

        const newSocialLogin = new AuthSocialLogin();
        newSocialLogin.email = email;
        newSocialLogin.external_id = externalId;
        newSocialLogin.refresh_token = refreshToken;
        newSocialLogin.user = existingUser;

        existingUser.socialLogins = [...(existingUser.socialLogins || []), newSocialLogin];

        await queryRunner.manager.save(User, existingUser);
        existingUser.logins = undefined;

        await queryRunner.commitTransaction();
        return existingUser;
      } else {
        // 새로운 사용자에게 소셜 로그인 추가
        const user = new User();
        user.name = name;
        user.role = RoleType.USER;
        user.login_type = loginType;
        user.set_profile = false;

        const newSocialLogin = new AuthSocialLogin();
        newSocialLogin.email = email;
        newSocialLogin.external_id = externalId;
        newSocialLogin.refresh_token = refreshToken;
        newSocialLogin.user = user;

        user.socialLogins = [newSocialLogin];
        
        const savedUser = await queryRunner.manager.save(User, user);
        savedUser.logins = undefined;

        await queryRunner.commitTransaction();
        return savedUser;
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 사용자 프로필을 생성하거나 업데이트하는 메소드
  async updateProfile(userId: number, profileData: UpdateProfileDto): Promise<UserProfile> {
    let userProfile = await this.userProfileRepository.findOne({ where: { user: { user_id: userId } } });

    if (!userProfile) {
      // 프로필이 없으면 새로 생성
      userProfile = this.userProfileRepository.create({ user: { user_id: userId }, ...profileData });
      console.log(userProfile)
      await this.userProfileRepository.save(userProfile);
    } else {
      // 프로필이 있으면 업데이트
      userProfile.nickname = profileData.nickname ?? userProfile.nickname;
      userProfile.phone = profileData.phone ?? userProfile.phone;
      userProfile.address = profileData.address ?? userProfile.address;
      userProfile.profile_img = profileData.profile_img ?? userProfile.profile_img;
      userProfile.prefer_sports = profileData.prefer_sports ?? userProfile.prefer_sports;
      userProfile.prefer_team = profileData.prefer_team ?? userProfile.prefer_team;

      await this.userProfileRepository.save(userProfile);
    }

    return userProfile;
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
  async findUserBySocial(externalId: string): Promise<User> {
    const socialLogin = await this.authSocialLoginRepository.findOne({
      where: { external_id: externalId },
      relations: ['user'],
    });

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
