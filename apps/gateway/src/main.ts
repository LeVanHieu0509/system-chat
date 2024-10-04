import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filter';

// const logger = new Logger('Bitback-Main');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.enableCors({ allowedHeaders: '*', exposedHeaders: '*', origin: '*' });

  app.useGlobalFilters(new GatewayExceptionFilter());
  // app.useGlobalFilters(new BadRequestExceptionFilter());
  // app.useGlobalInterceptors(new TransformResponseInterceptor());
  // app.useGlobalInterceptors(new VersionInterceptor());

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that are not expected
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
      transform: true, // Automatically transform payloads to match DTO classes
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Bitback API')
    .setDescription('Bitback API documentation')
    .setVersion('1.0')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: `
      .swagger-ui .topbar {
        display: none; /* Ẩn thanh trên cùng của Swagger UI */
      }
      .swagger-ui .opblock-summary {
        background-color: #e8f5e9; /* Đổi màu nền cho các API summary thành màu xanh lá nhạt */
        border-left: 5px solid #4caf50; /* Đường viền màu xanh lá đậm để dễ nhận diện */
        font-weight: bold; /* Làm đậm tiêu đề */
      }
      .swagger-ui .parameters-col_description {
        color: #000; /* Màu đen cho phần mô tả của parameters */
        background-color: #f6f6f6; /* Đổi màu nền mô tả thành màu sáng hơn */
        padding: 10px; /* Thêm padding để tạo khoảng trống cho văn bản */
      }
      .swagger-ui .response-col_description {
        color: #000; /* Đổi màu chữ của phần mô tả response thành màu đen */
        background-color: #f6f6f6; /* Đổi màu nền cho dễ nhìn hơn */
        font-weight: bold; /* Làm đậm chữ của phần mô tả */
        padding: 10px; /* Thêm padding để dễ nhìn */
      }
      .swagger-ui .parameter__name.required::after {
        content: ' *'; /* Thêm dấu * sau tên parameter bắt buộc */
        color: red; /* Màu đỏ cho dấu * */
      }
      .swagger-ui .btn.try-out__btn {
        background-color: #4caf50; /* Đổi màu của nút "Try it out" thành xanh lá */
        color: #ffffff;
      }
      .swagger-ui .btn.execute {
        background-color: #e67e22; /* Đổi màu của nút "Execute" thành cam */
        color: #ffffff;
      }
      .swagger-ui .responses-wrapper {
        padding: 20px; /* Tăng padding cho phần response */
        background: #ecf0f1; /* Đổi màu nền của phần response */
      }
      .swagger-ui .opblock .opblock-summary-method {
        color: #ffffff; /* Màu chữ của method */
        font-weight: bold;
      }
      .swagger-ui .opblock-post .opblock-summary-method {
        background: #4caf50; /* Đổi màu nền của method POST thành xanh lá */
      }
      .swagger-ui .opblock-get .opblock-summary-method {
        background: #2196f3; /* Đổi màu nền của method GET thành xanh dương */
      }
      .swagger-ui .opblock-delete .opblock-summary-method {
        background: #f44336; /* Đổi màu nền của method DELETE thành đỏ */
      }
      .swagger-ui .opblock-put .opblock-summary-method {
        background: #ff9800; /* Đổi màu nền của method PUT thành cam */
      }
    `,
    customSiteTitle: 'LAS API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, () =>
    console.log(`Bitback-Main is running at http://localhost:${port}`),
  );
}

bootstrap();
