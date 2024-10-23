import { QUEUES } from '@app/common/constants';
import { cashbackQueueOptionsProducer } from '@app/common/providers/queues/cashback-queue.provider';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { CashbackModule } from './cashback.module';

/*
  Cụ thể, nó triển khai một microservice sử dụng hàng đợi RabbitMQ.
*/
const logger = new Logger('Bitback-CashBack');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CashbackModule,
    cashbackQueueOptionsProducer,
  );
  // Đoạn mã này khởi động microservice và bắt đầu lắng nghe các tin nhắn đến từ hàng đợi cats_queue
  app.listen();

  // Ghi log khi microservice bắt đầu lắng nghe
  logger.log(`Bitback-Wallet is listening on queue: ${QUEUES.CASHBACK}`);
}

bootstrap();
