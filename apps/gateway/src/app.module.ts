import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import authenticatorQueueProvider from '@app/common/providers/queues/authenticator-queue.provider';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, authenticatorQueueProvider],
})
export class AppModule {}
