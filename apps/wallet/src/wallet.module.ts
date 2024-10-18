import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [], //để nhập các module khác cần thiết.
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
