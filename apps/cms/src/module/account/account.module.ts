import { default as walletQueueProvider } from '@app/common/providers/queues/wallet-queue.provider';
import { NotificationV2Service } from '@app/notification/notification-v2.service';
import { OTPModule } from '@app/otp';
import { RedlockModule } from '@app/redlock';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { RepoModule } from '@app/repositories/repo.module';
import { VNDCService } from 'libs/plugins';

@Module({
  imports: [RepoModule, OTPModule, HttpModule, RedlockModule.register()],
  controllers: [AccountController],
  providers: [
    AccountService,
    VNDCService,
    walletQueueProvider,
    NotificationV2Service,
  ],
})
export class AccountModule {}
