import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import rateLimit from 'express-rate-limit';
import { REQUEST_LIMIT, TIME_TO_LIMIT } from 'libs/config';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './filter';
import * as cookieParser from 'cookie-parser';

// const logger = new Logger('Bitback-Main');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.enableCors({ allowedHeaders: '*', exposedHeaders: '*', origin: '*' });

  const ttl = TIME_TO_LIMIT;
  const max = REQUEST_LIMIT;
  console.log(`ttl: ${ttl}`);
  console.log(`max: ${max}`);

  if (!Number.isNaN(ttl))
    app.use(rateLimit({ windowMs: ttl * 1000 || 1000, max: max || 20 }));

  app.useGlobalFilters(new GatewayExceptionFilter());
  // app.useGlobalFilters(new BadRequestExceptionFilter());
  // app.useGlobalInterceptors(new TransformResponseInterceptor());
  // app.useGlobalInterceptors(new VersionInterceptor());

  const port = 3000;
  await app.listen(port, () =>
    console.log(`Bitback-Main is running at http://localhost:${port}`),
  );
}

bootstrap();
