import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import authenticatorQueueProvider from '@app/common/providers/queues/authenticator-queue.provider';

@Module({
  imports: [HttpModule],
  controllers: [AuthController], // module này sẽ chịu trách nhiệm quản lý các route liên quan đến xác thực (auth). Controller nhận các yêu cầu HTTP từ client và chuyển đến AuthService để xử lý.
  providers: [AuthService, authenticatorQueueProvider], // Đây là các provider được khai báo trong module.
})
export class AppModule {}

/*
  Module cũng sử dụng một hàng đợi authenticatorQueueProvider để xử lý các tác vụ liên quan đến xác thực không đồng bộ.
*/
