import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { SwaggerSetup } from 'libs/swagger/swagger.module';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filter';
import { logger } from './middleware/global.middleware';

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

  SwaggerSetup.setup(app);

  const port = process.env.PORT || 3000;
  await app.listen(port, () =>
    console.log(`Bitback-Main is running at http://localhost:${port}`),
  );
}

bootstrap();
