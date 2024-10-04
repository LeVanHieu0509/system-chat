import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Next,
  Post,
  Req,
  Res,
  Session,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@app/common/decorators';
import { MainValidationPipe } from '@app/common/pipes';
import { OTPRequestDto, OTPTypeRequestDto } from 'libs/dto/src';
import { MESSAGE_PATTERN, OTP_TYPE, QUEUES } from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { ClientProxy } from '@nestjs/microservices';

/*
@Request(), @Req()      -- Truy cập toàn bộ đối tượng request (req) từ Express hoặc Fastify.
@Response(), @Res()*     -- Truy cập đối tượng response (res) để gửi phản hồi (HTTP response). (*Lưu ý: Khi sử dụng @Res(), bạn cần gọi res.send() hoặc phương thức tương tự để trả về phản hồi.)
@Next()                 -- Truy cập đối tượng next để chuyển tiếp quá trình xử lý đến middleware tiếp theo.
@Session()              -- Truy cập session từ đối tượng req.session.
@Param(key?: string)    -- Truy cập các tham số từ URL req.params hoặc req.params[key] nếu có khóa (key) cụ thể.
@Body(key?: string)     -- Truy cập dữ liệu trong body của request, req.body hoặc req.body[key] nếu có khóa (key) cụ thể.
@Query(key?: string)    -- Truy cập các tham số truy vấn từ URL req.query hoặc req.query[key].
@Headers(name?: string) -- Truy cập các header từ request req.headers hoặc req.headers[name] nếu có tên cụ thể.
@Ip()                  -- Truy cập địa chỉ IP của người gửi yêu cầu thông qua req.ip.
@HostParam()           -- Truy cập giá trị hostname từ req.hosts (thường được sử dụng trong các tình huống yêu cầu phụ thuộc vào hostname).
*/

@Controller('auth')
export class AuthController {
  // Tạo một logger để ghi log các sự kiện trong controller.
  private readonly _logger = new Logger(AuthController.name);

  // Sử dụng dependency injection để inject đối tượng ClientProxy tương ứng với hàng đợi (queue) xác thực (AUTHENTICATOR) vào controller.
  // Điều này giúp controller có thể gửi tin nhắn qua RabbitMQ đến các microservice khác.
  @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy;

  //Controllers are responsible for handling incoming requests and returning responses to the client.
  constructor(private readonly authService: AuthService) {}

  // --------------------------------------- NESTJS ----------------------------------------//
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/nestjs')
  async nestJs(@Req() req, @Res() res, @Next() next, @Session() ses) {
    console.log({ ses });

    return res.send({ status: 1 });
  }

  // --------------------------------------- BITBACK ----------------------------------------//

  @Public() // Decorator này chỉ ra rằng route này là public, không cần xác thực.
  @HttpCode(HttpStatus.OK) //Đặt mã trạng thái trả về HTTP là 200 (OK) nếu yêu cầu thành công.

  // Áp dụng một validation pipe để kiểm tra dữ liệu đầu vào.
  // skipMissingProperties: true có nghĩa là bỏ qua việc kiểm tra các thuộc tính bị thiếu.
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Post('request-otp')

  // Phương thức này xử lý logic khi người dùng gửi yêu cầu OTP:
  async requestOTP(@Body() body: OTPRequestDto) {
    this._logger.log(`requestOTP -> body: ${JSON.stringify(body)}`);

    if (body.type === OTP_TYPE.VERIFY_EMAIL && !body.email) {
      // Dùng để ném ra một ngoại lệ HTTP 400 khi có yêu cầu không hợp lệ.
      throw new BadRequestException([
        { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID },
      ]);
    }
    if (
      Object.values(OTP_TYPE).findIndex((t) => t.toString() === body.type) != -1
    )
      // Phương thức này gửi một tin nhắn đến microservice qua RabbitMQ
      // Phương thức này trả về kết quả (true hoặc false) dựa trên việc OTP
      // Có được xử lý thành công bởi microservice khác hay không.
      return this._clientAuth.send<boolean, OTPRequestDto & OTPTypeRequestDto>(
        MESSAGE_PATTERN.AUTH.REQUEST_OTP,
        body,
      );
    else {
      return false;
    }
  }
}
