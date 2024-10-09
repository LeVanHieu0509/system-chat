import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { AuthenticatorService } from './authenticator.service';
import { HttpModule } from '@nestjs/axios';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { RepoModule } from 'libs/repositories/repo.module';

@Module({
  imports: [RepoModule, HttpModule], //để nhập các module khác cần thiết.
  controllers: [AuthenticatorController],
  providers: [
    AuthenticatorService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter }, // để xử lý logic hoặc thêm các thành phần hỗ trợ (như filter xử lý lỗi).
  ],
})
export class AuthenticatorModule {}
