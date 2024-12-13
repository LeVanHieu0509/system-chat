import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { json, urlencoded } from 'body-parser';
import { ThirdPartyModule } from './third-party.module';
import { SwaggerSetup } from 'libs/swagger/swagger.module';

const logger = new Logger('Bitback-Third Party');

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(ThirdPartyModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    allowedHeaders: '*',
    exposedHeaders: '*',
    origin: '*',
  });
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // Open port only on development
  const port = 3007;
  SwaggerSetup.setup(app);

  await app.listen(port, () =>
    logger.log(`Bitback-Third Party is running at http://localhost:${port}`),
  );
}

bootstrap();
