import { default as authenticatorQueueProvider } from '@app/common/providers/queues/authenticator-queue.provider';
import { default as walletQueueProvider } from '@app/common/providers/queues/wallet-queue.provider';
import { NotificationV2Service } from '@app/notification/notification-v2.service';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MainMiddleware } from '../../middleware';
import { OnusController } from './onus.controller';
import { OnusService } from './onus.service';
import { LockModule, SharedModule } from '../../dynamic/share.module';
import { VNDCService } from 'libs/plugins';
import { RepoModule } from '@app/repositories/repo.module';

@Module({
  imports: [
    SharedModule.forRoot(),
    LockModule.forRoot(),
    RepoModule,
    HttpModule,
  ],
  controllers: [OnusController],
  providers: [
    OnusService,
    VNDCService,
    walletQueueProvider,
    authenticatorQueueProvider,
    // NotificationV2Service,
  ],
})
export class OnusModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes(OnusController);
  }
}
