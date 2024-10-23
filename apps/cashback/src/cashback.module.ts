import { RepoModule } from '@app/repositories/repo.module';
import { Module } from '@nestjs/common';
import { CashbackService } from './cashback.service';
import { CashbackController } from './cashback.controller';
import walletQueueProvider from '@app/common/providers/queues/wallet-queue.provider';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [RepoModule, HttpModule], //để nhập các module khác cần thiết.
  controllers: [CashbackController],
  providers: [
    CashbackService,
    walletQueueProvider,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class CashbackModule {}
