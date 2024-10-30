import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 모든 라우트의 기본 경로를 '/members'로 설정
  app.setGlobalPrefix('members');
  
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
