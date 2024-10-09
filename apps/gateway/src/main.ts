import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { SwaggerSetup } from 'libs/swagger/swagger.module';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filter';
import { logger } from './middleware/global.middleware';
import { BadRequestExceptionFilter } from '@app/common/filters/bad-request.filter';

// const logger = new Logger('Bitback-Main');

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
  // app.useGlobalInterceptors(new TransformResponseInterceptor());
  // app.useGlobalInterceptors(new VersionInterceptor());

  SwaggerSetup.setup(app);

  const port = process.env.PORT || 3000;
  await app.listen(port, () =>
    console.log(`Bitback-Main is running at http://localhost:${port}`),
  );
}

bootstrap();
