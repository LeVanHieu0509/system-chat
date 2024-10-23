import { Controller, Logger } from '@nestjs/common';
import { CashbackService } from './cashback.service';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { MESSAGE_PATTERN } from '@app/common';
import { VersionQueryDto } from '@app/dto/common';
import { Ack } from '@app/common/decorators/ack.decorator';

@Controller('cashback')
export class CashbackController {
  private readonly _logger = new Logger(CashbackController.name);

  constructor(private readonly _service: CashbackService) {}

  @MessagePattern(MESSAGE_PATTERN.CASHBACK.COIN_LIST)
  getCoin(@Payload() input: VersionQueryDto, @Ack() _: RmqContext) {
    return this._service.getCoinList(input);
  }
}
