import {
  KYC,
  MainValidationPipe,
  MESSAGE_PATTERN,
  PATH_CONTAIN_ID,
  Public,
  QUEUES,
  RedlockMeta,
} from '@app/common';
import { AuthUser } from '@app/common/decorators/auth-user.decorator';
import { LockInterceptor } from '@app/common/interceptors/lock.interceptor';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  Auth,
  BuySatoshiRequestDto,
  BuyVNDCInquiryRequestDto,
  BuyVNDCRequestDto,
  VersionQueryDto,
} from '@app/dto';
import { UtilsService } from '@app/utils';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VNDCService } from 'libs/plugins';
import { firstValueFrom } from 'rxjs';

@ApiTags('PayMe')
@ApiResponse({ status: 200, description: 'Created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@Controller('api/payme')
export class PaymeController {
  private readonly _logger = new Logger(PaymeController.name);

  constructor(
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Cancel Transaction buy VNDC' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Delete('cancel-transaction' + PATH_CONTAIN_ID)
  async cancelTransaction(@Param('id') id: string) {
    await firstValueFrom(
      this._clientAuth.send<boolean, string>(
        MESSAGE_PATTERN.VNDC.CANCEL_TRANSACTION,
        id,
      ),
    );

    return { status: true };
  }

  @ApiOperation({ summary: 'Confirm OrderId Payment Transaction buy VNDC' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Patch('payme-transaction/:id')
  async updateStatusTransaction(
    @Param('id') id: string,
    @AuthUser() { userId }: Auth,
  ) {
    return this._clientAuth.send<
      boolean,
      { orderId: string; accountId: string }
    >(MESSAGE_PATTERN.VNDC.UPDATE_STATUS_TRANSACTION, {
      orderId: id,
      accountId: userId,
    });
  }

  @ApiOperation({ summary: 'get transactions' })
  @HttpCode(HttpStatus.OK)
  @Get('get-transaction')
  async getPartnerTran(
    @Query() query: VersionQueryDto,
    @AuthUser() { userId }: Auth,
  ) {
    return this._clientAuth.send(MESSAGE_PATTERN.VNDC.GET_TRANSACTION, {
      ...query,
      userId,
    });
  }

  /*
    1. Nạp 100,000 SAT với giá tiền thanh toán 2,277,550đ đang được xử lý.
  */
  @ApiOperation({ summary: 'buy shatoshi' })
  // @KYC()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  // @RedlockMeta({
  //   key: MESSAGE_PATTERN.VNDC.BUY_SATOSHI,
  //   error: new BadRequestException([
  //     {
  //       field: 'account',
  //       message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING,
  //     },
  //   ]),
  // })
  // @UseInterceptors(LockInterceptor)
  @Post('buy-satoshi')
  async buySatoshi(
    @Body() body: BuySatoshiRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.debug(`buySatoshi -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<
      number,
      BuySatoshiRequestDto & { accountId: string }
    >(MESSAGE_PATTERN.VNDC.BUY_SATOSHI, { ...body, accountId: userId });
  }
}
