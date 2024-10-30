import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserProfile } from 'src/users/entities/user_profile.entity';
import { AuthLogin, AuthSocialLogin } from 'src/auths/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, AuthLogin, AuthSocialLogin]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
