import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { Request, Response } from 'express';
import { NODE_ENV } from 'libs/config';
import { CmsModule } from './cms.module';
import { SerializeBigIntInterceptor } from '@app/common/interceptors/serialize-bigint.interceptor';

const logger = new Logger('Bitback-CMS');

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

async function bootstrap() {
  const isDev = NODE_ENV !== 'production';
  const app = await NestFactory.create<NestExpressApplication>(CmsModule);
  app.setGlobalPrefix('cms');
  app.enableCors({
    allowedHeaders: '*',
    exposedHeaders: '*',
    origin: isDev
      ? '*'
      : [
          process.env.BITBACK_CMS_DOMAIN,
          ...process.env.BITBACK_ALLOWED_DOMAINS.split(','),
        ],
  });

  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.useGlobalInterceptors(new SerializeBigIntInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = 3005;
  await app.listen(port, () =>
    logger.log(`Bitback-CMS is running at http://localhost:${port}`),
  );
}

bootstrap();
