import { BadRequestExceptionFilter } from '@app/common/filters/bad-request.filter';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from 'apps/gateway/src/app.module';
import { GatewayExceptionFilter } from 'apps/gateway/src/filter';
import { logger } from 'apps/gateway/src/middleware/global.middleware';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { SwaggerSetup } from 'libs/swagger/swagger.module';
import { KafkaModule } from './kafka.module';

// const logger = new Logger('Bitback-Main');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(KafkaModule);

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

  const port = 3010;
  await app.listen(port, () =>
    console.log(`Bitback-Kafka is running at http://localhost:${port}`),
  );
}

bootstrap();
