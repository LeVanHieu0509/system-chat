import { Module } from '@nestjs/common';
import { OnusModule } from './module/onus/onus.module';

@Module({
  imports: [OnusModule],
  controllers: [],
  providers: [],
})
export class ThirdPartyModule {}
