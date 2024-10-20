import { RepoModule } from '@app/repositories/repo.module';
import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
@Module({
  imports: [RepoModule], //để nhập các module khác cần thiết.
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
