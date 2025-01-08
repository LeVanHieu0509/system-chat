import {
  MainValidationPipe,
  MESSAGE_PATTERN,
  PATH_CONTAIN_ID,
  QUEUES,
  RedlockMeta,
} from '@app/common';
import { AuthUser } from '@app/common/decorators/auth-user.decorator';
import { LockInterceptor } from '@app/common/interceptors/lock.interceptor';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { Auth, BuySatoshiRequestDto, VersionQueryDto } from '@app/dto';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  // sử dụng cơ chế kiểm tra trước khi cho phép giao dịch. Đây là đặc điểm của khóa bi quan
  @RedlockMeta({
    key: MESSAGE_PATTERN.VNDC.BUY_SATOSHI,
    error: new BadRequestException([
      {
        field: 'account',
        message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING, // Nếu đã khóa: ném lỗi (meta.error).
      },
    ]),
  })
  @UseInterceptors(LockInterceptor)
  @Post('buy-satoshi')
  async buySatoshi(
    @Body() body: BuySatoshiRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.debug(`buySatoshi -> body: ${JSON.stringify(body)}`);

    /*
      1. Sử dụng decorator RedlockMeta để tạo key red lock
      2. Dùng UseInterceptors LockInterceptor để khoá bi quan lại sử dụng thư viện redlock
      3. Dùng key đó để khoá đoạn logic đó lại theo key user, đảm bảo mỗi user chỉ được truy cập vào tài nguyên ở 1 thời điểm
      4. Khóa chỉ được giải phóng khi đoạn logic send message này hoàn thành
      5. Thành công thì trả về kết quả, còn thất bại thì trả về exception
      6. Sau khi đoạn logic xử lý xong
          - Nếu thành công: Interceptor gọi lock.unlock() trong tap
          - Nếu thất bại: Interceptor gọi lock.unlock() trong catchError để giải phóng khóa.
      7. Nếu như có 100 user request đồng thời thì request đầu tiên sẽ giữ được khoá và 99 request còn lại sẽ bị từ chối đến khi nào khoá được giải phóng thì mới ok
      8. 99 request đó có thể được đưa vào hàng đợi để chờ xử lý.
    */

    return this._clientAuth.send<
      number,
      BuySatoshiRequestDto & { accountId: string }
    >(MESSAGE_PATTERN.VNDC.BUY_SATOSHI, { ...body, accountId: userId });
  }
}
