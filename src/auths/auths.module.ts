import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWTConfig } from '../configs/jwt.config';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserProfile } from 'src/users/entities/user_profile.entity';
import { AuthLogin, AuthSocialLogin } from 'src/auths/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, AuthLogin, AuthSocialLogin]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: JWTConfig,
    }),
    UsersModule
  ],
  controllers: [AuthsController],
  providers: [AuthsService, JwtStrategy, GoogleStrategy],
})
export class AuthsModule {}
