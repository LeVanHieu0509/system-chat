import { default as walletQueueProvider } from '@app/common/providers/queues/wallet-queue.provider';
import { Module } from '@nestjs/common';
import { REDIS_HOST, REDIS_PASS, REDIS_PORT } from 'libs/config';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { RepoModule } from '@app/repositories/repo.module';
import { VNDCService } from 'libs/plugins';
import { PROCESSORS } from './constants';
import { AccessTradeJob } from './access-trade.job';
import { MainRepo } from '@app/repositories/main.repo';
import { NotificationV2Service } from '@app/notification/notification-v2.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASS,
      },
    }),
    BullModule.registerQueue({
      name: PROCESSORS.STAKING,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: false },
    }),
    HttpModule,
    RepoModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    MainRepo,
    VNDCService,
    // NotificationV2Service,
    // CronjobService,
    AccessTradeJob,
    // StakingJob,
    VNDCService,

    walletQueueProvider,
  ],
})
export class CronJobModule {}
