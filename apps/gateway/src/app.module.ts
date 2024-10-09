import authenticatorQueueProvider from '@app/common/providers/queues/authenticator-queue.provider';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { REQUEST_LIMIT, TIME_TO_LIMIT } from 'libs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionMiddleware } from './middleware/session.middleware';
import { SessionController } from './session.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [HttpModule], // HttpModule được import để sử dụng các tính năng về HTTP
  controllers: [AuthController, SessionController], // module này sẽ chịu trách nhiệm quản lý các route liên quan đến xác thực (auth). Controller nhận các yêu cầu HTTP từ client và chuyển đến AuthService để xử lý.
  providers: [AuthService, authenticatorQueueProvider], // Đây là các provider được khai báo trong module.
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const ttl = TIME_TO_LIMIT;
    const max = REQUEST_LIMIT;

    const logger = new Logger('Bitback-Main');

    const rateLimiter = rateLimit({
      windowMs: TIME_TO_LIMIT * 1000 || 1000,
      max: REQUEST_LIMIT || 20,
    });

    logger.log(`Rate Limit - TTL: ${ttl}, Max: ${max}`);

    // Middleware kiểm tra điều kiện để áp dụng rate limiter
    const conditionalRateLimiter = (req, res, next) => {
      if (req.originalUrl.includes('/swagger')) {
        return next();
      }

      rateLimiter(req, res, next);
    };

    consumer
      .apply(conditionalRateLimiter, SessionMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}

/*
  1. Module cũng sử dụng một hàng đợi authenticatorQueueProvider để xử lý các tác vụ liên quan đến xác thực không đồng bộ.
  2. @Module trong NestJS là một decorator dùng để tổ chức và quản lý các thành phần của ứng dụng

  3. Tái Sử Dụng: Bằng cách chia nhỏ ứng dụng thành các module, bạn có thể tái sử dụng logic và 
  dễ dàng import module này vào module khác mà không phải viết lại code.
  4. Độc Lập và Dễ Mở Rộng: Khi có một module riêng biệt, bạn có thể cập nhật, 
  nâng cấp hoặc sửa chữa module đó mà không lo ảnh hưởng đến các phần còn lại của ứng dụng.
  5. Phân Chia Trách Nhiệm: Các module giúp chia nhỏ ứng dụng theo chức năng, giúp cho việc phân chia trách nhiệm trở nên rõ ràng và dễ quản lý hơn.
  6. Dependency Injection: Các provider được quản lý tốt hơn và dễ dàng được inject thông qua NestJS bằng cách sử dụng @Injectable và @Module.
*/

/*
  Tạo 1 module ở thư lục libs để tất cả các micro service có thể import vào để mà sử dụng được được providers của module đó bằng cách là khai báo ra.
*/
