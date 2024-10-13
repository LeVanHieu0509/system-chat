import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const extractAuthCacheKey = (req: any) => {
  return req.user['userId'] + req.originalUrl;
};

@Injectable()
export class AuthCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { user: { userId: string } }>();

    // Kiểm tra xem yêu cầu có thông tin người dùng không, nếu không thì ném ra UnauthorizedException
    if (!req.user) {
      throw new UnauthorizedException();
    }

    // Tạo cache key dựa trên userId và đường dẫn yêu cầu
    return extractAuthCacheKey(req);
  }
}
