import { Account } from '@app/dto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { verifyIdToken } from 'apple-signin-auth';
import { lastValueFrom } from 'rxjs';

const GOOGLE_URL_GET_INFO_BY_ACCESS_TOKEN =
  'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=';
const FACEBOOK_URL_GET_INFO_BY_ACCESS_TOKEN =
  'https://graph.facebook.com/me?fields=id,picture,name,email&access_token=';

type TokenPayload = {
  id: string;
  email: string;
  verified_email: true;
  name: string;
  picture: string;
  sub: string;
};

@Injectable()
export class AuthThirdPartyService {
  private readonly _logger = new Logger('AuthThirdPartyService');

  constructor(private readonly httpService: HttpService) {}

  /*
        Đây là một hàm đăng nhập bằng Google OAuth. 
        Nó nhận accessToken từ phía client (do Google cấp), 
        gọi đến Google API để lấy thông tin user, và trả về một object Account chứa thông tin người dùng.
    */
  async signInWithGoogle(accessToken: string): Promise<Account> {
    // Đừng log accessToken trong môi trường production vì lý do bảo mật (nếu cần log, hãy ẩn một phần token).
    this._logger.log(`signInWithGoogle accessToken: ${accessToken}`);
    const url = GOOGLE_URL_GET_INFO_BY_ACCESS_TOKEN + accessToken;
    try {
      // this.httpService.get() sử dụng HttpService của NestJS (dựa trên Axios).
      const info = (
        await lastValueFrom(this.httpService.get<TokenPayload>(url))
      ).data;

      //  Bước 4: Trả về thông tin user trong object Account
      return {
        email: info.email,
        emailVerified: info.verified_email,
        googleId: info.id,
        avatar: info.picture,
        fullName: info.name,
      };
    } catch (error) {
      this._logger.log(`signInWithGoogle Error: ${JSON.stringify(error)}`);
      return null;
    }
  }

  async signInWithFacebook(accessToken: string) {
    this._logger.log(`signInWithFacebook accessToken: ${accessToken}`);
    const url = FACEBOOK_URL_GET_INFO_BY_ACCESS_TOKEN + accessToken;
    try {
      const info = (await lastValueFrom(this.httpService.get(url))).data;
      this._logger.log(`signInWithFacebook response: ${JSON.stringify(info)}`);
      return {
        facebookId: info.id,
        fullName: info.name,
        avatar: info.picture?.data?.url,
        email: info.email,
      };
    } catch (error) {
      this._logger.log(`signInWithFacebook Error: ${JSON.stringify(error)}`);
      return null;
    }
  }

  async signInWithApple(accessToken: string) {
    this._logger.log(`signInWithApple accessToken: ${accessToken}`);
    try {
      const info = await verifyIdToken(accessToken, { ignoreExpiration: true });
      this._logger.log(`signInWithApple response: ${JSON.stringify(info)}`);
      return { appleId: info.sub, email: info.email };
    } catch (error) {
      this._logger.log(`signInWithApple Error: ${JSON.stringify(error)}`);
      return null;
    }
  }
}
