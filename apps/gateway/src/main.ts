import { BadRequestExceptionFilter } from '@app/common/filters/bad-request.filter';
import { TransformResponseInterceptor } from '@app/common/interceptors/transform-response.interceptor';
import { VersionInterceptor } from '@app/common/interceptors/version.interceptor';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { SwaggerSetup } from 'libs/swagger/swagger.module';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filter';
import { logger } from './middleware/global.middleware';
// const logger = new Logger('Bitback-Main');

// sử dụng single thread để chạy ứng dụng
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.enableCors({ allowedHeaders: '*', exposedHeaders: '*', origin: '*' });

  // Global middleware
  app.use(logger);

  app.useGlobalFilters(new GatewayExceptionFilter());
  app.useGlobalFilters(new BadRequestExceptionFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalInterceptors(new VersionInterceptor());

  SwaggerSetup.setup(app);

  const port = process.env.PORT || 3000;
  await app.listen(port, () =>
    console.log(`Bitback-Main is running at http://localhost:${port}`),
  );
}

bootstrap();

/*
  1. Webpack Build: Mỗi service chạy webpack để biên dịch mã nguồn TypeScript sang JavaScript
  2. Khởi động Nest Application: Mỗi dịch vụ khởi chạy một ứng dụng NestJS độc lập.
  3. Khởi tạo Dependencies: Mỗi ứng dụng NestJS khởi tạo các dependencies cần thiết như RepoModule, AuthModule, CmsModule và các service khác.
  4. Thiết lập các Route/Queue: Mỗi service định nghĩa các routes hoặc lắng nghe các message queues.
  5. Thông báo Service Started: Mỗi service thông báo khi đã khởi động thành công.
  6. Mỗi lệnh yarn dev:<service> được khởi chạy như một process độc lập trong hệ điều hành.
  7. Hệ điều hành có thể tận dụng tất cả các lõi CPU để chạy từng service song song => Tăng hiệu suất và khả năng mở rộng (scalability).
*/
