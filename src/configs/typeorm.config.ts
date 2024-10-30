import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export function TypeOrmConfig(configService: ConfigService){
  const option: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: Number(configService.get('DB_PORT')),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_SCHEMA'),
    entities: [__dirname + configService.get('ENTITY_PATH')],
    synchronize: configService.get('DB_SYNC'),
    logging: configService.get('DB_LOGGING'),
  };

  return option
}