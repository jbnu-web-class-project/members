import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 모든 라우트의 기본 경로를 '/members'로 설정
  app.setGlobalPrefix('members');
  
  // CORS 활성화
  app.enableCors({
    origin: '*', // 허용할 도메인
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 허용할 HTTP 메서드
    allowedHeaders: 'Content-Type', // 허용할 헤더
  });
  
  await app.listen(3000);
}
bootstrap();
