import {
  MainValidationPipe,
  MESSAGE_PATTERN,
  PAY_ME_RESPONSE_CODE,
  Public,
  QUEUES,
  RedlockMeta,
} from '@app/common';
import { LockInterceptor } from '@app/common/interceptors/lock.interceptor';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';

import { KycIPNData } from '@app/dto';
import { REDLOCK, REDLOCK_TTL } from '@app/redlock/redlock.contants';
import {
  ArgumentsHost,
  BadRequestException,
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Query,
  Res,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { IS_PRODUCTION } from 'libs/config';
import { default as Redlock } from 'redlock';
import { ONUS_ERROR } from './constanst';
import {
  OnusCallbackRequestDto,
  OnusMembershipQueryDto,
  OnusResponseDto,
} from './onus.dto';
import { OnusService } from './onus.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

const FAILURE = 'failure';
const SUCCESS = 'success';

// @Catch(BadRequestException)
// class BadRequestExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const status = exception.getStatus();

//     const json: OnusResponseDto = {
//       status: FAILURE,
//       errorCode: 'BAD_REQUEST',
//       message: 'Arguments are not valid',
//     };
//     response.status(status).json(json);
//   }
// }

@ApiTags('Onus')
@ApiResponse({ status: 200, description: 'Created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
// @UseFilters(BadRequestExceptionFilter)
@Controller('onus')
export class OnusController {
  private readonly _logger = new Logger(OnusController.name);

  @Inject(REDLOCK) private readonly _redlock: Redlock;
  @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy;

  constructor(private readonly _service: OnusService) {}

  @ApiOperation({ summary: 'Pre Check' })
  @ApiBody({ type: OnusMembershipQueryDto })
  @Public()
  @UsePipes(new MainValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('precheck')

  // Kiểm tra thông tin tài khoản trên hệ thống ONUS trước khi xử lý giao dịch
  async checkAccount(
    @Body() body: OnusMembershipQueryDto,
    @Query() { uuid }: { uuid: string },
    @Res() res: Response,
  ) {
    this._logger.log(`checkAccount Onus ---> ${JSON.stringify(body)}`);
    let json: OnusResponseDto = {
      status: SUCCESS,
      message: 'Check account successful',
    };
    let status: HttpStatus = HttpStatus.OK;
    try {
      // Gọi phương thức checkAccount từ OnusService để kiểm tra thông tin tài khoản trên hệ thống ONUS.
      const account = await this._service.checkAccount(body, uuid);
      console.log({ account });
      const { email, fullName, phone } = account;
      json.data = { email, fullName, phone };
    } catch (error) {
      console.log(error);
      const { message } = error as Error;
      const errorMsg = ONUS_ERROR[message];
      if (errorMsg) {
        json = { status: FAILURE, errorCode: message, message: errorMsg };
        status = HttpStatus.BAD_REQUEST;
      } else {
        const isDev = !IS_PRODUCTION;
        json = {
          status: FAILURE,
          errorCode: 'UNKNOWN_ERROR',
          message: isDev ? message : VALIDATE_MESSAGE.SOMETHING_WENT_WRONG,
        };
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    //Trả về trạng thái SUCCESS kèm theo thông tin tài khoản.
    return res.status(status).json(json);
  }

  @Public()
  @UsePipes(new MainValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('callback')

  // Xử lý thông báo (callback) từ ONUS khi trạng thái giao dịch thay đổi.
  // Nhận thông báo từ ONUS qua endpoint onus/callback,
  // bao gồm thông tin giao dịch như transactionNumber và trạng thái.

  // Đây là một phần quan trọng trong quy trình xử lý giao dịch,
  // đảm bảo rằng trạng thái giao dịch từ hệ thống đối tác(ONUS) được đồng bộ hóa với hệ thống của bạn
  async callback(
    @Body() body: OnusCallbackRequestDto,
    @Query() { uuid }: { uuid: string },
    @Res() res: Response,
  ) {
    let json: OnusResponseDto = {
      status: SUCCESS,
      message: 'Process transaction successful',
    };
    let status: HttpStatus = HttpStatus.OK;

    // Sử dụng cơ chế khóa (Redlock): Đảm bảo chỉ một luồng xử lý giao dịch với cùng uuid + transactionNumber tại một thời điểm.
    const lockKey = uuid + body.transactionNumber;
    const lock = (await this._redlock.acquire([lockKey], REDLOCK_TTL)) as any;
    try {
      // Khi ONUS thông báo giao dịch đã thành công hoặc thất bại,
      // hệ thống của bạn cần cập nhật trạng thái giao dịch tương ứng và gửi thông báo cho người dùng.
      await this._service.processTransaction(body, uuid);

      // Sau khi xử lý xong, mở khóa (lock.unlock) để các giao dịch khác có thể tiếp tục
      lock.unlock();
    } catch (error) {
      console.log(error);
      const { message } = error as Error;
      const errorMsg = ONUS_ERROR[message];
      if (errorMsg) {
        json = { status: FAILURE, errorCode: message, message: errorMsg };
        status = HttpStatus.BAD_REQUEST;
        lock.unlock();
      } else {
        const isDev = !IS_PRODUCTION;
        json = {
          status: FAILURE,
          errorCode: 'UNKNOWN_ERROR',
          message: isDev ? message : VALIDATE_MESSAGE.SOMETHING_WENT_WRONG,
        };
        status = HttpStatus.BAD_REQUEST;
      }
    }
    return res.status(status).json(json);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @RedlockMeta({
    key: MESSAGE_PATTERN.VNDC.KYC_IPN,
    error: new BadRequestException([
      { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
    ]),
    thirdParty: true,
  })
  @UseInterceptors(LockInterceptor)

  // Xử lý thông báo về trạng thái KYC (xác minh danh tính) từ hệ thống ONUS.
  // Nhận thông báo từ ONUS qua endpoint onus/kyc-ipn
  @Post('kyc-ipn')
  async handleKycIPN(@Body() body: KycIPNData) {
    // const checkSum = this._payMe.checksum(body);
    // if (!checkSum) return { code: PAY_ME_RESPONSE_CODE.REQUEST_FAIL };

    // this._logger.log(`handleKycIPN -> body: ${JSON.stringify(body)}`);

    // Gửi dữ liệu KYC đến một service khác trong hệ thống của bạn thông qua MESSAGE_PATTERN.VNDC.KYC_IPN.
    await firstValueFrom(
      this._clientAuth.send<unknown, unknown>(
        MESSAGE_PATTERN.VNDC.KYC_IPN,
        body,
      ),
    );

    // Nếu giao dịch yêu cầu xác minh danh tính (KYC),
    // hàm này nhận thông tin KYC từ ONUS và cập nhật trạng thái trong hệ thống của bạn.
    return { code: PAY_ME_RESPONSE_CODE.REQUEST_SUCCESS };
  }
}
