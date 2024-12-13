import { MESSAGE_PATTERN } from '@app/common';
import { Ack } from '@app/common/decorators/ack.decorator';
import {
  Auth,
  BuyVNDCInquiryRequestDto,
  ExchangeV3InquiryDto,
  ExchangeV3SubmitDto,
  ExchangeV3VerifyPasscodeDto,
} from '@app/dto';
import { VersionQueryDto } from '@app/dto/common';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CashbackService } from './cashback.service';
import { CashbackExchangeV3Service } from './cashback-exchange-v3.service';
import { AccessTradeJob } from 'apps/cronjob/src/access-trade.job';

@Controller('cashback')
export class CashbackController {
  private readonly _logger = new Logger(CashbackController.name);

  constructor(
    private readonly _service: CashbackService,
    private readonly _exchangeV3Service: CashbackExchangeV3Service,
    private readonly _accessTrader: AccessTradeJob,
  ) {}

  @MessagePattern(MESSAGE_PATTERN.CASHBACK.COIN_LIST)
  getCoin(@Payload() input: VersionQueryDto, @Ack() _: RmqContext) {
    return this._service.getCoinList(input);
  }

  @MessagePattern(MESSAGE_PATTERN.VNDC.BUY_VNDC)
  buyVNDC(
    @Payload()
    input: BuyVNDCInquiryRequestDto & { accountId: string; orderId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.buyVNDC(input);
  }

  @MessagePattern(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.INQUIRY)
  exchangeV3Inquiry(
    @Payload() { userId, body }: Auth & { body: ExchangeV3InquiryDto },
    @Ack() _: RmqContext,
  ) {
    return this._exchangeV3Service.inquiry(userId, body);
  }

  @MessagePattern(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.VERIFY_PASSCODE)
  exchangeV3VerifyPasscode(
    @Payload() { userId, body }: Auth & { body: ExchangeV3VerifyPasscodeDto },
    @Ack() _: RmqContext,
  ) {
    return this._exchangeV3Service.verifyPasscode(userId, body);
  }

  @MessagePattern(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.SUBMIT)
  exchangeV3Submit(
    @Payload() { userId, body }: Auth & { body: ExchangeV3SubmitDto },
    @Ack() _: RmqContext,
  ) {
    return this._exchangeV3Service.submit(userId, body);
  }

  @MessagePattern(MESSAGE_PATTERN.CASHBACK.CASHBACK_LIST)
  getCashbackList(
    @Payload() input: VersionQueryDto & Auth,
    @Ack() _: RmqContext,
  ) {
    return this._service.getCashback(input);
  }

  // Cronjob
  @MessagePattern(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.APPROVED)
  getTransactionFromAccessTradeOnApproved(
    @Payload() input: VersionQueryDto & Auth,
    @Ack() _: RmqContext,
  ) {
    console.log({ input });
    const a = this._accessTrader.getTransactionFromAccessTradeOnApproved();
    return a;
  }
}
