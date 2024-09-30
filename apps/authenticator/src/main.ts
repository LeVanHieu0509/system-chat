import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthenticatorModule } from './authenticator.module';
import { QUEUES } from '@app/common';
import { RABBITMQ_URLS } from 'libs/config';
import { Logger } from '@nestjs/common';

/*
  Cụ thể, nó triển khai một microservice sử dụng hàng đợi RabbitMQ.
*/
const logger = new Logger('Bitback-Authenticator');

async function bootstrap() {
  // Ở đây, bạn sử dụng RabbitMQ làm phương thức giao tiếp giữa các microservices.

  // Nó cho phép các dịch vụ (microservices) trao đổi thông tin mà không cần biết đến nhau,
  // giúp tách biệt các thành phần và tăng tính mở rộng, cải thiện hiệu suất mà còn làm cho việc quản lý và bảo trì hệ thống trở nên dễ dàng hơn.

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthenticatorModule,
    {
      transport: Transport.RMQ, // Bạn chọn sử dụng RabbitMQ làm giao thức giao tiếp giữa các microservices.
      options: {
        //Các tùy chọn cấu hình RabbitMQ.

        // prefetchCount: Sets the prefetch count for the channel
        // isGlobalPrefetchCount: Enables per channel prefetching
        // noAck: If false, manual acknowledgment mode enabled
        // consumerTag: Consumer Tag Identifier (read more here)
        //queueOptions: Additional queue options (read more here)
        // socketOptions: Additional socket options
        // headers: Headers to be sent along with every message

        urls: RABBITMQ_URLS, //Đây là URL kết nối tới RabbitMQ server đang chạy trên localhost
        queue: QUEUES.AUTHENTICATOR, //Tên của hàng đợi mà microservice sẽ kết nối tới, Microservice sẽ gửi và nhận tin nhắn từ hàng đợi này
        queueOptions: {
          durable: false, //Điều này có nghĩa là hàng đợi không được ghi lại trên đĩa và sẽ bị xóa nếu RabbitMQ server dừng
        },
        noAck: false,
      },
    },
  );

  // Đoạn mã này khởi động microservice và bắt đầu lắng nghe các tin nhắn đến từ hàng đợi cats_queue
  app.listen();

  // Ghi log khi microservice bắt đầu lắng nghe
  logger.log(
    `Bitback-Authenticator is listening on queue: ${QUEUES.AUTHENTICATOR}`,
  );
}

bootstrap();

/*
  1. Producer gửi tin nhắn: Khi một microservice (producer) cần gửi thông tin, nó tạo ra một tin nhắn và gửi nó đến RabbitMQ.
  2. RabbitMQ lưu trữ tin nhắn: RabbitMQ nhận tin nhắn và lưu trữ vào hàng đợi đã chỉ định.
  3. Consumer nhận tin nhắn: Các microservices (consumer) kết nối với RabbitMQ, lấy tin nhắn từ hàng đợi và xử lý chúng.
  4. Xác nhận hoàn tất: Sau khi xử lý xong, consumer gửi thông báo xác nhận về RabbitMQ để thông báo rằng tin nhắn đã được xử lý thành công.
*/
