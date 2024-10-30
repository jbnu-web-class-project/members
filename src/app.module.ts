import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmConfig } from './configs/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthsModule } from './auths/auths.module';

@Module({
  imports: [ConfigModule.forRoot({
              envFilePath: `env/.${process.env.NODE_ENV}.env`,
              isGlobal: true,}),
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: TypeOrmConfig,
            }), UsersModule, AuthsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
