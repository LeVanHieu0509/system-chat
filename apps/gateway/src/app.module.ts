import authenticatorQueueProvider from '@app/common/providers/queues/authenticator-queue.provider';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { REQUEST_LIMIT, TIME_TO_LIMIT } from 'libs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionMiddleware } from './middleware/session.middleware';
import { SessionController } from './session.controller';

@Module({
  imports: [HttpModule],
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

    consumer.apply(conditionalRateLimiter, SessionMiddleware).forRoutes('*');
  }
}

/*
  Module cũng sử dụng một hàng đợi authenticatorQueueProvider để xử lý các tác vụ liên quan đến xác thực không đồng bộ.
*/
