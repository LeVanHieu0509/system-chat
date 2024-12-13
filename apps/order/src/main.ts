import { KAFKA } from '@app/common/constants';
import { orderKafkaOptionsProducer } from '@app/common/providers/kafka/authenticator-queue.provider';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { OrderModule } from './order.module';

/*
  Cụ thể, nó triển khai một microservice sử dụng hàng đợi RabbitMQ.
*/
const logger = new Logger('Bitback-Kafka');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    orderKafkaOptionsProducer,
  );
  // Đoạn mã này khởi động microservice và bắt đầu lắng nghe các tin nhắn đến từ hàng đợi cats_queue
  app.listen();

  // Ghi log khi microservice bắt đầu lắng nghe
  logger.log(`Bitback-kafka is listening on queue: ${KAFKA.ORDER}`);
}

bootstrap();
