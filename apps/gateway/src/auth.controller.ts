import { OTP_TYPE } from '@app/common/constants';
import { Public } from '@app/common/decorators';
import { MainValidationPipe } from '@app/common/pipes';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HostParam,
  HttpCode,
  HttpStatus,
  Ip,
  Logger,
  Param,
  Post,
  Query,
  Redirect,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OTPRequestDto } from 'libs/dto/src';
import { AuthService } from './auth.service';

/*
@Request(), @Req()      -- Truy cập toàn bộ đối tượng request (req) từ Express hoặc Fastify.
@Response(), @Res()*     -- Truy cập đối tượng response (res) để gửi phản hồi (HTTP response).
(*Lưu ý: Khi sử dụng @Res(), bạn cần gọi res.send() hoặc phương thức tương tự để trả về phản hồi.)
Nếu sử dụng mà không sài res.send or res.json thì server sẽ bị treo.

@Next()                 -- Truy cập đối tượng next để chuyển tiếp quá trình xử lý đến middleware tiếp theo.
@Session()              -- Truy cập session từ đối tượng req.session.
@Param(key?: string)    -- Truy cập các tham số từ URL req.params hoặc req.params[key] nếu có khóa (key) cụ thể.
@Body(key?: string)     -- Truy cập dữ liệu trong body của request, req.body hoặc req.body[key] nếu có khóa (key) cụ thể.
@Query(key?: string)    -- Truy cập các tham số truy vấn từ URL req.query hoặc req.query[key].

@Headers(name?: string) -- Truy cập các header từ request req.headers hoặc req.headers[name] nếu có tên cụ thể.
@Ip()                  -- Truy cập địa chỉ IP của người gửi yêu cầu thông qua req.ip.
@HostParam()           -- Truy cập giá trị hostname từ req.hosts (thường được sử dụng trong các tình huống yêu cầu phụ thuộc vào hostname).
*/

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // Tạo một logger để ghi log các sự kiện trong controller.
  private readonly _logger = new Logger(AuthController.name);

  //Controllers are responsible for handling incoming requests and returning responses to the client.
  constructor(private readonly authService: AuthService) {}

  // --------------------------------------- NESTJS ----------------------------------------//
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/nestjs/:id')
  async nestJs(
    @Param('id') id: string,
    @Query('hieu') hieu: string,
    @Query('hieu1') hieu1: string,
    @Headers('Authorization') Authorization: string,
    @Headers('Authorization1') Authorization1: string,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwardedIp: string,
    @HostParam() hostParam: string,
  ) {
    this._logger.log({
      id,
      hieu,
      hieu1,
      Authorization,
      Authorization1,
      ip,
      forwardedIp,
      hostParam,
    });

    return { status: 1 };
  }

  @Post('/redirect')
  @Redirect('/docs', 302) // Chuyển hướng đến controller khác tại đường dẫn /docs
  redirectToDocs(@Query('version') version: string) {
    if (version === '5') {
      return { url: '/docs/v5' }; // Nếu có version=5, chuyển hướng đến /docs/v5
    }
  }

  // --------------------------------------- BITBACK ----------------------------------------//

  @ApiOperation({ summary: 'Request Otp' })
  @ApiParam({ name: 'id', description: 'The ID of the item to retrieve' })
  @ApiResponse({ status: 200, description: 'Created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Public() // Decorator này chỉ ra rằng route này là public, không cần xác thực.
  @HttpCode(HttpStatus.OK) //Đặt mã trạng thái trả về HTTP là 200 (OK) nếu yêu cầu thành công.

  // Áp dụng một validation pipe để kiểm tra dữ liệu đầu vào.
  // skipMissingProperties: true có nghĩa là bỏ qua việc kiểm tra các thuộc tính bị thiếu.
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Post('request-otp')

  // Phương thức này xử lý logic khi người dùng gửi yêu cầu OTP:
  async requestOTP(@Body() body: OTPRequestDto) {
    this._logger.log(`requestOTP -> body: ${JSON.stringify(body)}`);

    // Dùng để ném ra một ngoại lệ HTTP 400 khi có yêu cầu không hợp lệ.
    if (body.type === OTP_TYPE.VERIFY_EMAIL && !body.email) {
      throw new BadRequestException([
        { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID },
      ]);
    }

    if (
      Object.values(OTP_TYPE).findIndex((t) => t.toString() === body.type) != -1
    )
      return await this.authService.sendOtpRequest(body);
    else {
      return false;
    }
  }
}

/*
  - Nếu controller đơn giản chỉ gửi qua rabbit MQ thì có thể viết trong controller luôn để tránh viết nhiều code.
  - Nếu controler xử lý trực tiếp thì nên đưa logic qua service để viết.
  - Hạn chế sử dụng @Res() để cho phép NestJS tự động xử lý response và tránh treo server.
  - Việc loại bỏ @Res() và @Next() giúp NestJS tự động xử lý response. Điều này làm cho mã dễ quản lý và giảm nguy cơ lỗi do quên gọi res.send() hoặc next().
*/
