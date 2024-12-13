import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { AuthenticatorService } from './authenticator.service';
import { HttpModule } from '@nestjs/axios';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { RepoModule } from 'libs/repositories/repo.module';
import walletQueueProvider from '@app/common/providers/queues/wallet-queue.provider';
import { PartnerService } from './partner.service';
import { VNDCService } from 'libs/plugins';

@Module({
  imports: [RepoModule, HttpModule], //để nhập các module khác cần thiết.
  controllers: [AuthenticatorController],
  providers: [
    VNDCService,
    PartnerService,
    AuthenticatorService,
    walletQueueProvider,
    { provide: APP_FILTER, useClass: HttpExceptionFilter }, // để xử lý logic hoặc thêm các thành phần hỗ trợ (như filter xử lý lỗi).
  ],
})
export class AuthenticatorModule {}
