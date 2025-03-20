import {
  MainValidationPipe,
  MESSAGE_PATTERN,
  PATH_CONTAIN_ID,
  Public,
  QUEUES,
} from '@app/common';
import { AuthUser } from '@app/common/decorators/auth-user.decorator';
import { AuthCacheInterceptor } from '@app/common/interceptors/auth-cache.interceptor';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  AccountCommissionHistoriesQueryDto,
  Auth,
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
  Post,
  Query,
  UseInterceptors,
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
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
    @Inject(QUEUES.CASHBACK) private readonly _clientCashback: ClientProxy,
  ) {}

  /*
    1. Tạo giao dịch mua VNDC trong hệ thống (bao gồm ghi nhận giao dịch và xử lý trạng thái giao dịch).
    2. Thực hiện các bước cần thiết để đảm bảo giao dịch được thực hiện đúng cách.
  */

  // @KYC()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())

  // Sử dụng decorator @RedlockMeta để khóa logic xử lý giao dịch
  // nếu người dùng đang có giao dịch khác đang được xử lý (trạng thái PENDING).

  // @RedlockMeta({
  //   key: MESSAGE_PATTERN.VNDC.CREATE_BUY_VNDC_TRANSACTION,
  //   error: new BadRequestException([
  //     {
  //       field: 'account',
  //       message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING,
  //     },
  //   ]),
  // })
  @ApiOperation({ summary: 'Buy VNDC' })
  @ApiBody({ type: BuyVNDCRequestDto })
  // @UseInterceptors(LockInterceptor)
  @Post('buy-vndc')
  async createBuyVNDCTransaction(
    @Body() body: BuyVNDCRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`buyVNDC -> body: ${JSON.stringify(body.storeId)}`);
    // storeId: Mỗi partner khi trở thành thương lái thì sẽ được tạo cho 1 mã storeId để nhận diện được
    // User đó là thương lái nào?

    return this._clientAuth.send<
      number,
      BuyVNDCRequestDto & { accountId: string }
    >(MESSAGE_PATTERN.VNDC.CREATE_BUY_VNDC_TRANSACTION, {
      ...body,
      accountId: userId,
    });
  }

  /*
    1. Thực hiện kiểm tra thông tin ban đầu (inquiry) cho giao dịch mua VNDC, 
    2. bao gồm kiểm tra tài khoản VNDC của người nhận có hợp lệ hay không.
  */

  @ApiOperation({ summary: 'Buy VNDC Inquire' })
  @HttpCode(HttpStatus.OK)
  // @UsePipes(new MainValidationPipe())
  @Post('buy-vndc/inquiry')
  async buyVNDCInquiry(
    @Body() body: BuyVNDCInquiryRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.debug(`buyVNDCInquiry -> body: ${JSON.stringify(body)}`);
    // check account VNDC valid
    // const receiver = await this._vndc.getAccountVNDC(body.vndcReceiver);
    const receiver = { name: 'Le Van Hieu', kyc: true, keywords: '123123' };

    if (!receiver || !receiver.kyc) {
      throw new BadRequestException([
        {
          field: 'vndcReceiver',
          message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID,
        },
      ]);
    }
    const orderId = UtilsService.getInstance().getDbDefaultValue().id;
    this._clientCashback.emit<
      boolean,
      BuyVNDCInquiryRequestDto & { accountId: string; orderId: string }
    >(MESSAGE_PATTERN.VNDC.BUY_VNDC, { ...body, accountId: userId, orderId });
    return { ...body, orderId: orderId.replace(/[-]/gm, '') };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  // @UsePipes(new MainValidationPipe())
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

  // dash board

  @UseInterceptors(AuthCacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('dashboard')
  async getTotalCommission(@AuthUser() { userId }: Auth) {
    return this._clientAuth.send<boolean, string>(
      MESSAGE_PATTERN.AUTH.GET_TOTAL_COMMISSION,
      userId,
    );
  }

  @UseInterceptors(AuthCacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('v2/dashboard/commission')
  async getCommissionHistoriesV2(
    @Query() query: AccountCommissionHistoriesQueryDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(
      `getCommissionHistoriesV2 -> query: ${JSON.stringify(query)}`,
    );
    return this._clientAuth.send<
      boolean,
      { query: AccountCommissionHistoriesQueryDto; id: string }
    >(MESSAGE_PATTERN.AUTH.GET_COMMISSION_HISTORIES_V2, { id: userId, query });
  }
}
