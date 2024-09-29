import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthenticatorModule } from './authenticator.module';

/*
  Cụ thể, nó triển khai một microservice sử dụng hàng đợi RabbitMQ.
*/
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthenticatorModule,
    {
      transport: Transport.RMQ, // Bạn chọn sử dụng RabbitMQ làm giao thức giao tiếp giữa các microservices.
      options: {
        //Các tùy chọn cấu hình RabbitMQ.
        urls: ['amqp://localhost:5672'], //Đây là URL kết nối tới RabbitMQ server đang chạy trên localhost
        queue: 'cats_queue', //Tên của hàng đợi mà microservice sẽ kết nối tới, Microservice sẽ gửi và nhận tin nhắn từ hàng đợi này
        queueOptions: {
          durable: false, //Điều này có nghĩa là hàng đợi không được ghi lại trên đĩa và sẽ bị xóa nếu RabbitMQ server dừng
        },
      },
    },
  );

  // Đoạn mã này khởi động microservice và bắt đầu lắng nghe các tin nhắn đến từ hàng đợi cats_queue
  await app.listen();
}

bootstrap();
