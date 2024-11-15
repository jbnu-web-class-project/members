import { Injectable, UnauthorizedException } from "@nestjs/common";
import axios from 'axios';

@Injectable()
export class GoogleAuthService {
  async verifyGoogleAccessToken(googleAccessToken: string): Promise<boolean> {
    try {
      // 구글 토큰 검증 API 호출
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${googleAccessToken}`,
      );

      // 응답 데이터에서 클라이언트 ID가 맞는지 확인
      if (response.data && response.data.aud === process.env.GOOGLE_CLIENT_ID) {
        return true; // 유효한 구글 토큰
      }

      throw new UnauthorizedException("유효하지 않은 Google Access Token입니다.");
    } catch (error) {
      throw new UnauthorizedException("Google Access Token 검증 중 오류가 발생했습니다.");
    }
  }
}