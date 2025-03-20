import {
  KYC,
  MainValidationPipe,
  MESSAGE_PATTERN,
  Public,
  QUEUES,
} from '@app/common';
import { AuthUser } from '@app/common/decorators/auth-user.decorator';
import { AuthCacheInterceptor } from '@app/common/interceptors/auth-cache.interceptor';
import {
  Auth,
  ExchangeV3InquiryDto,
  ExchangeV3SubmitDto,
  ExchangeV3VerifyPasscodeDto,
} from '@app/dto';
import { VersionQueryDto } from '@app/dto/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('CashBack')
@ApiResponse({ status: 200, description: 'Created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@Controller('api/cashback')
export class CashbackController {
  private readonly _logger = new Logger(CashbackController.name);

  constructor(
    @Inject(QUEUES.CASHBACK) private readonly _clientCashback: ClientProxy,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get Coins' })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('coins')
  async getCoins(@Query() query: VersionQueryDto) {
    return this._clientCashback.send(MESSAGE_PATTERN.CASHBACK.COIN_LIST, query);
  }

  @KYC()
  @Public()
  @ApiOperation({ summary: 'Inquiry' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('inquiry')
  async inquiry(
    @Body() body: ExchangeV3InquiryDto,
    // @AuthUser() { userId }: Auth,
  ) {
    this._logger.debug(`inquiry -> body: ${JSON.stringify(body)}`);
    let userId = '3402dfb2-c83e-4d4a-8a51-8104af775b38';

    return this._clientCashback.send<
      boolean,
      { userId: string; body: ExchangeV3InquiryDto }
    >(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.INQUIRY, { userId, body });
  }

  @KYC()
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('verify-passcode')
  async verifyPasscode(
    @Body() body: ExchangeV3VerifyPasscodeDto,
    // @AuthUser() { userId }: Auth,
  ) {
    let userId = '3402dfb2-c83e-4d4a-8a51-8104af775b38';
    this._logger.debug(`verifyPasscode -> body: ${JSON.stringify(body)}`);
    return this._clientCashback.send<
      boolean,
      { userId: string; body: ExchangeV3VerifyPasscodeDto }
    >(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.VERIFY_PASSCODE, { userId, body });
  }

  @KYC()
  @Public()
  @ApiOperation({ summary: 'Submit' })
  // @RedlockMeta({
  //     key: MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.SUBMIT,
  //     error: new BadRequestException([{ field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID }])
  // })
  // @UseInterceptors(LockInterceptor)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('submit')
  async submit(
    @Body() body: ExchangeV3SubmitDto,
    // @AuthUser() { userId }: Auth,
  ) {
    this._logger.debug(`submit -> body: ${JSON.stringify(body)}`);
    let userId = '3402dfb2-c83e-4d4a-8a51-8104af775b38';

    return this._clientCashback.send<
      boolean,
      { userId: string; body: ExchangeV3SubmitDto }
    >(MESSAGE_PATTERN.CASHBACK_EXCHANGE_V3.SUBMIT, { userId, body });
  }

  @UseInterceptors(AuthCacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get()
  async getCashback(
    @Query() query: VersionQueryDto,
    @AuthUser() { userId }: Auth,
  ) {
    return this._clientCashback.send<boolean, VersionQueryDto & Auth>(
      MESSAGE_PATTERN.CASHBACK.CASHBACK_LIST,
      {
        ...query,
        userId,
      },
    );
  }

  @Public()
  @UsePipes(new MainValidationPipe())
  @Get('introduce')
  async getIntroduceValue() {
    return this._clientCashback.send(MESSAGE_PATTERN.CASHBACK.INTRODUCE, '');
  }
}
