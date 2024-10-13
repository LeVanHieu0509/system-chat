import { PassportStrategy } from '@nestjs/passport';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { JWT_SECRET_KEY } from 'libs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CachingService } from 'libs/caching/src';
import { MESSAGE_PATTERN, QUEUES } from '@app/common/constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
  ) {
    super({
      // Chỉ định cách thức lấy token từ request. Ở đây nó lấy từ Authorization header dạng Bearer token.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET_KEY, // Khóa bí mật để giải mã JWT, được lưu trong JWT_SECRET_KEY.
      passReqToCallback: true, // Điều này cho phép chuyển đối tượng request vào trong callback của validate.
    });
  }

  // xử lý thêm logic liên quan
  async validate(req: Request, { id: userId }) {
    // Sử dụng ExtractJwt để lấy access token từ Authorization header.
    const extractFn = ExtractJwt.fromAuthHeaderAsBearerToken();
    const accessToken = extractFn(req);

    // Mục đích là kiểm tra token hiện tại có giống với token trong cache không
    const tokenFromCache = await CachingService.getInstance().get(
      `BITBACK-${userId}`,
    );

    if (accessToken !== tokenFromCache) {
      throw new UnauthorizedException();
    }

    // Gửi yêu cầu đến authClient để lấy thông tin người dùng như phone và kycStatus thông qua microservice
    const { phone, kycStatus } = await firstValueFrom(
      this._clientAuth.send(MESSAGE_PATTERN.AUTH.GET_PROFILE, userId),
    );

    return { userId, phone, kycStatus };
  }
}

/*
    1. JwtStrategy giúp xác thực người dùng dựa trên JWT bằng cách mở rộng từ chiến lược Passport-JWT.
    2. CachingService được sử dụng để kiểm tra token từ cache nhằm đảm bảo tính hợp lệ của token.
    3. ClientProxy được sử dụng để giao tiếp với các microservice nhằm lấy thông tin người dùng.
    4. Guard và strategy này giúp bảo vệ các route, đảm bảo rằng chỉ có người dùng có JWT hợp lệ mới có thể truy cập vào.
*/
