import { CachingService } from '@app/caching';
import {
  MainValidationPipe,
  MESSAGE_PATTERN,
  PATH_CONTAIN_ID,
  Public,
  QUEUES,
} from '@app/common';
import { AuthUser } from '@app/common/decorators/auth-user.decorator';
import { Auth } from '@app/dto';
import { HttpStatus, Param, Query } from '@nestjs/common';
import {
  Controller,
  Get,
  HttpCode,
  Inject,
  UsePipes,
} from '@nestjs/common/decorators';
import { ClientProxy } from '@nestjs/microservices';

@Controller('api/cronjob')
export class CronjobController {
  constructor(
    @Inject(QUEUES.CASHBACK) private readonly _clientCashback: ClientProxy,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Get('/get-transaction-from-access-trade-on-approved')
  async getTransactionFromAccessTradeOnApproved() {
    // const cache = await CachingService.getInstance().get(
    //   MESSAGE_PATTERN.CAMPAIGN.DETAIL + `${id}-${userId}`,
    // );
    // if (cache) return cache;
    // return this._client.send<
    //   boolean,
    //   { id: string; userId: string; phone: string }
    // >(MESSAGE_PATTERN.CAMPAIGN.DETAIL, {
    //   id,
    //   userId,
    //   phone,
    // });

    return this._clientCashback.send(
      MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.APPROVED,
      '',
    );
  }
}
