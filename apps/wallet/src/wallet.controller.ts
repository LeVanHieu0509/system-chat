import { MESSAGE_PATTERN } from '@app/common';
import { Ack } from '@app/common/decorators/ack.decorator';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { RevertBalancePayloadDto } from './common/dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  private readonly _logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @MessagePattern(MESSAGE_PATTERN.WALLET.NONE_ACCOUNT_REFERRAL)
  async noneAccountReferral(
    @Payload() input: RevertBalancePayloadDto,
    @Ack() _: RmqContext,
  ) {
    this._logger.log(`noneAccountReferral --> ${JSON.stringify(input)}`);

    return this.walletService.increaseBalance(
      input.cbTransaction,
      input.version,
    );
  }
}
