import { NestFactory } from '@nestjs/core';
import { CronJobModule } from './cronjob.module';

async function bootstrap() {
  const app = await NestFactory.create(CronJobModule);

  await app.listen(30000);
}
bootstrap();
