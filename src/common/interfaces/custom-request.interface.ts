import { Request } from 'express';

// req.user의 타입을 확장하여 정의
export interface CustomRequest extends Request {
    user?: any; // 'user'를 명시적으로 정의
  }