import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import authenticatorQueueProvider from '@app/common/providers/queues/authenticator-queue.provider';
import { SessionController } from './session.controller';
import { SessionMiddleware } from './middleware/session.middleware';

@Module({
  imports: [HttpModule],
  controllers: [AuthController, SessionController], // module này sẽ chịu trách nhiệm quản lý các route liên quan đến xác thực (auth). Controller nhận các yêu cầu HTTP từ client và chuyển đến AuthService để xử lý.
  providers: [AuthService, authenticatorQueueProvider], // Đây là các provider được khai báo trong module.
})

/*
    Lớp SessionMiddleware được tạo để quản lý cấu hình và áp dụng session.
    Middleware được áp dụng cho toàn bộ ứng dụng thông qua MiddlewareConsumer trong AppModule.
    Session middleware vẫn hoạt động như mong đợi, và bạn có thể truy cập session trong các controller thông qua decorator @Session().
*/
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}

/*
  Module cũng sử dụng một hàng đợi authenticatorQueueProvider để xử lý các tác vụ liên quan đến xác thực không đồng bộ.
*/
