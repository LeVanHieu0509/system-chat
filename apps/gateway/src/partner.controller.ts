import {
  MainValidationPipe,
  MESSAGE_PATTERN,
  PATH_CONTAIN_ID,
  Public,
  QUEUES,
} from '@app/common';
import { BuyVNDCRequestDto } from '@app/dto';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Partner')
@ApiResponse({ status: 200, description: 'Created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@Controller('api/partner')
export class PartnerController {
  private readonly _logger = new Logger(PartnerController.name);

  constructor(
    @Inject(QUEUES.CASHBACK) private readonly _clientCashback: ClientProxy,
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
  ) {}

  // @KYC()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  // @RedlockMeta({
  //   key: MESSAGE_PATTERN.VNDC.CREATE_BUY_VNDC_TRANSACTION,
  //   error: new BadRequestException([
  //     {
  //       field: 'account',
  //       message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING,
  //     },
  //   ]),
  // })
  @Public()
  @ApiOperation({ summary: 'Buy VNDC' })
  @ApiBody({ type: BuyVNDCRequestDto })
  // @UseInterceptors(LockInterceptor)
  @Post('buy-vndc')
  async createBuyVNDCTransaction(
    @Body() body: BuyVNDCRequestDto,
    // @AuthUser() { userId = '032dda8b-9a62-4d2d-9d99-c21ff44695e7' }: Auth,
  ) {
    this._logger.log(`buyVNDC -> body: ${JSON.stringify(body)}`);

    let userId = '032dda8b-9a62-4d2d-9d99-c21ff44695e7';

    return this._clientAuth.send<
      number,
      BuyVNDCRequestDto & { accountId: string }
    >(MESSAGE_PATTERN.VNDC.CREATE_BUY_VNDC_TRANSACTION, {
      ...body,
      accountId: userId,
    });
  }

  @ApiOperation({ summary: 'Cancel Transaction buy VNDC' })
  @Public()
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
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Patch('partner-transaction/:id')
  async updateStatusTransaction(
    @Param('id') id: string,
    // @AuthUser() { userId }: Auth,
  ) {
    let userId = '032dda8b-9a62-4d2d-9d99-c21ff44695e7';
    return this._clientAuth.send<
      boolean,
      { orderId: string; accountId: string }
    >(MESSAGE_PATTERN.VNDC.UPDATE_STATUS_TRANSACTION, {
      orderId: id,
      accountId: userId,
    });
  }
}
