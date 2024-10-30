import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export function JWTConfig(configService: ConfigService){
    const option: JwtModuleOptions = {
      secret: configService.get('JWT_SECRET'),
      signOptions: { expiresIn: '30m' },
    };
  
    return option
  }