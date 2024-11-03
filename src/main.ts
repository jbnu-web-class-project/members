import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 모든 라우트의 기본 경로를 '/api/members'로 설정
  app.setGlobalPrefix('api/members');
  
  // CORS 활성화
  app.enableCors({
    origin: true,  // 모든 origin 허용
    credentials: true
  });
  
  await app.listen(3000);
}
bootstrap();
