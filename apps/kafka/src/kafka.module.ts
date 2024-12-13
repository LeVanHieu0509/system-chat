import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtRolesAuthGuard } from 'apps/gateway/src/jwt/jwt-roles.guard';
import { LoggerMiddleware } from 'apps/gateway/src/middleware/logger.middleware';
import * as redisStore from 'cache-manager-ioredis';
import rateLimit from 'express-rate-limit';
import {
  CACHE_MAX,
  CACHE_TTL,
  CMS_JWT_EXPIRATION_TIME,
  JWT_SECRET_KEY,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT,
  REQUEST_LIMIT,
  TIME_TO_LIMIT,
} from 'libs/config';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import orderKafkaProvider from '@app/common/providers/kafka/authenticator-queue.provider';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: JWT_SECRET_KEY,
          signOptions: { expiresIn: CMS_JWT_EXPIRATION_TIME },
        };
      },
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: REDIS_HOST,
        port: REDIS_PORT,
        auth_pass: REDIS_PASS,
        ttl: CACHE_TTL,
        max: CACHE_MAX,
      }),
    }),
  ], // HttpModule được import để sử dụng các tính năng về HTTP
  controllers: [KafkaController], // module này sẽ chịu trách nhiệm quản lý các route liên quan đến xác thực (auth). Controller nhận các yêu cầu HTTP từ client và chuyển đến AuthService để xử lý.
  providers: [
    KafkaService,
    orderKafkaProvider,
    { provide: APP_GUARD, useClass: JwtRolesAuthGuard },
  ], // Đây là các provider được khai báo trong module.
})
export class KafkaModule {
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

    consumer.apply(conditionalRateLimiter, LoggerMiddleware).forRoutes('*');
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
