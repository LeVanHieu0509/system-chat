import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const extractAuthCacheKey = (req: any) => {
  // Điều này giúp đảm bảo rằng mỗi người dùng sẽ có cache riêng cho mỗi endpoint (địa chỉ URL) mà họ truy cập.
  return req.user['userId'] + req.originalUrl;
};

/*
  1. Lưu trữ thông tin người dùng (user profile, settings, v.v.) trong cache.
  2. Tăng hiệu suất cho các API yêu cầu xác thực người dùng, 
  3. giúp giảm tải cho cơ sở dữ liệu và tối ưu hóa việc truy xuất dữ liệu.
*/

@Injectable()
export class AuthCacheInterceptor extends CacheInterceptor {
  // Đầu tiên, trackBy lấy thông tin yêu cầu (request) từ ExecutionContext.
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

// Interceptor này được sử dụng để tạo và quản lý key cache cho các yêu cầu
// dựa trên thông tin người dùng (userId) và đường dẫn URL của yêu cầu.
// Key này đảm bảo rằng mỗi người dùng sẽ có một bộ cache riêng biệt cho thông tin profile của họ.
