import {
  DEFAULT_EXPIRES_GET,
  MESSAGE_PATTERN,
  OTP_TYPE,
  PATH_CONTAIN_ID,
  QUEUES,
} from '@app/common/constants';
import { Public } from '@app/common/decorators';
import { MainValidationPipe } from '@app/common/pipes';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  AccessTokenRequestDto,
  Auth,
  ChangeEmailRequestDto,
  ChangePhoneRequestDto,
  CheckPhoneRequestDto,
  ConfirmEmailRequestDto,
  FindAccountRequestDto,
  OTPRequestDto,
  PaginationDto,
  ReadAllNotificationRequestDto,
  ReferralQueryDto,
  RefreshTokenRequestDto,
  ResetPasscodeRequestDto,
  SettingAccountRequestDto,
  SigninRequestDto,
  SignupRequestDto,
  SyncContactRequestDto,
  TransactionHistoryQueryDto,
  UpdateAccountSettingBodyDto,
  UpdateDeviceTokenRequestDto,
  UserProfileRequestDto,
  VerifyOTPRequestDto,
  VerifyPasscodeSigninRequestDto,
} from '@app/dto';
import { AuthService } from './auth.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AuthUser } from '@app/common/decorators/auth-user.decorator';
import { ClientProxy } from '@nestjs/microservices';
import {
  AuthCacheInterceptor,
  extractAuthCacheKey,
} from '@app/common/interceptors/auth-cache.interceptor';
import { CachingService } from '@app/caching';
import { firstValueFrom, tap } from 'rxjs';

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
@ApiResponse({ status: 200, description: 'Created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@Controller('auth')
export class AuthController {
  // Tạo một logger để ghi log các sự kiện trong controller.
  private readonly _logger = new Logger(AuthController.name);

  //Controllers are responsible for handling incoming requests and returning responses to the client.
  constructor(
    private readonly authService: AuthService,
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
  ) {}

  // --------------------------------------- NESTJS ----------------------------------------//
  // @Public()
  // @HttpCode(HttpStatus.OK)
  // @Post('/nestjs/:id')
  // async nestJs(
  //   @Param('id') id: string,
  //   @Query('hieu') hieu: string,
  //   @Query('hieu1') hieu1: string,
  //   @Headers('Authorization') Authorization: string,
  //   @Headers('Authorization1') Authorization1: string,
  //   @Ip() ip: string,
  //   @Headers('x-forwarded-for') forwardedIp: string,
  //   @HostParam() hostParam: string,
  // ) {
  //   this._logger.log({
  //     id,
  //     hieu,
  //     hieu1,
  //     Authorization,
  //     Authorization1,
  //     ip,
  //     forwardedIp,
  //     hostParam,
  //   });

  //   return { status: 1 };
  // }

  // @Post('/redirect')
  // @Redirect('/docs', 302) // Chuyển hướng đến controller khác tại đường dẫn /docs
  // redirectToDocs(@Query('version') version: string) {
  //   if (version === '5') {
  //     return { url: '/docs/v5' }; // Nếu có version=5, chuyển hướng đến /docs/v5
  //   }
  // }

  // --------------------------------------- BITBACK ----------------------------------------//

  @ApiOperation({ summary: 'Request Otp' })
  @Public() // Decorator này chỉ ra rằng route này là public, không cần xác thực.
  @HttpCode(HttpStatus.OK) //Đặt mã trạng thái trả về HTTP là 200 (OK) nếu yêu cầu thành công.

  // Áp dụng một validation pipe để kiểm tra dữ liệu đầu vào.
  // skipMissingProperties: true có nghĩa là bỏ qua việc kiểm tra các thuộc tính bị thiếu.
  @UsePipes(new MainValidationPipe())
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

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPRequestDto) {
    this._logger.log(`verifyOTP -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<boolean, VerifyOTPRequestDto>(
      MESSAGE_PATTERN.AUTH.VERIFY_OTP,
      body,
    );
  }

  // --------------------------------------- GET ACCOUNT ----------------------------------------//
  @ApiOperation({ summary: 'Get Account' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('get-account')
  async getAccount(@Body() body: FindAccountRequestDto) {
    this._logger.log(`getAccount --> params: ${JSON.stringify(body)}`);
    return await this.authService.getAccount(body);
  }

  // ---------------------------------------Verify Pass code Sign Up ----------------------------------------//
  @ApiOperation({ summary: 'Verify Pass Code SignUp' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('v2/sign-up')
  async verifyPasscodeSignUp(@Body() body: SignupRequestDto) {
    this._logger.log(`verifyPasscodeSignUp --> body: ${JSON.stringify(body)}`);
    return await this.authService.verifyPasscodeSignUp(body);
  }

  // --------------------------------------- Sign Up ----------------------------------------//
  @ApiOperation({ summary: 'Sign Up With Google' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('v2/sign-in-google')
  async signInWithGoogle(@Body() body: AccessTokenRequestDto) {
    this._logger.log(`Sign Up With Google --> body: ${JSON.stringify(body)}`);
    return await this.authService.signInWithGoogle(body);
  }

  @ApiOperation({ summary: 'Sign In With PassCode' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('v2/verify-passcode')
  async verifyPasscodeSignIn(@Body() body: VerifyPasscodeSigninRequestDto) {
    this._logger.log(`verifyPasscodeSignIn -> body: ${JSON.stringify(body)}`);
    return await this.authService.verifyPasscodeSignIn(body);
  }

  @ApiOperation({ summary: 'RefreshToken' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('refresh-token')
  async refreshToken(@Query() query: RefreshTokenRequestDto) {
    this._logger.log(`refreshToken -> query: ${JSON.stringify(query)}`);
    return await this.authService.refreshToken(query);
  }

  @ApiOperation({ summary: 'Change Phone' })
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('v2/change-phone')
  async changePhone(
    @Body() body: ChangePhoneRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    console.log({ userId });

    this._logger.log(`changePhone -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<string, { phone: string; userId: string }>(
      MESSAGE_PATTERN.AUTH.CHANGE_PHONE,
      {
        phone: body.phone,
        userId,
      },
    );
  }

  @ApiOperation({ summary: 'Verify Phone' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('v2/verify-phone')
  async verifyPhone(@AuthUser() { userId }: Auth) {
    this._logger.log(`verifyPhone -> userId: ${userId}`);
    return this._clientAuth.send<string, string>(
      MESSAGE_PATTERN.AUTH.CONFIRM_PHONE,
      userId,
    );
  }

  @ApiOperation({ summary: 'Get Profile' })
  @UseInterceptors(AuthCacheInterceptor)
  @Get('profile')
  async getProfile(@AuthUser() { userId }: Auth) {
    this._logger.log(`getProfile -> userId: ${userId}`);
    return this._clientAuth.send<string, string>(
      MESSAGE_PATTERN.AUTH.GET_PROFILE,
      userId,
    );
  }

  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('profile')
  async editProfile(
    @Body() account: UserProfileRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`editProfile -> body: ${JSON.stringify(account)}`);
    return this._clientAuth.send<string, UserProfileRequestDto & Auth>(
      MESSAGE_PATTERN.AUTH.EDIT_PROFILE,
      {
        ...account,
        userId,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('check-phone')
  async checkPhone(
    @AuthUser() { userId }: Auth,
    @Body() body: CheckPhoneRequestDto,
  ) {
    this._logger.log(`checkPhone -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<boolean, CheckPhoneRequestDto & Auth>(
      MESSAGE_PATTERN.AUTH.CHECK_PHONE,
      { userId, ...body },
    );
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('v2/pre-check-phone')
  async preCheckPhone(
    @AuthUser() { userId }: Auth,
    @Body() body: CheckPhoneRequestDto,
  ) {
    this._logger.log(`preCheckPhone -> body: ${JSON.stringify(body)}`);
    const cached = await CachingService.getInstance().get<{
      expiresIn: number;
      otp: string;
    }>(`PRE-CHECK-PHONE-${userId}`);
    if (cached && cached.expiresIn > Date.now()) {
      throw new BadRequestException([
        {
          field: 'phone',
          message: VALIDATE_MESSAGE.ACCOUNT.PHONE_SENT,
          expiresIn: cached.expiresIn,
          otp: cached.otp,
        },
      ]);
    }

    return this._clientAuth.send<unknown, CheckPhoneRequestDto & Auth>(
      MESSAGE_PATTERN.AUTH.PRE_CHECK_PHONE,
      {
        userId,
        ...body,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('v2/pre-check-phone-otp')
  async preCheckPhoneOtp(
    @AuthUser() { userId }: Auth,
    @Body() body: CheckPhoneRequestDto,
  ) {
    this._logger.log(`preCheckPhoneOtp -> body: ${JSON.stringify(body)}`);

    const key = `PRE-CHECK-PHONE-${userId}`;
    const cached = await CachingService.getInstance().get<{
      phone: string;
      expiresIn: number;
      otp?: string;
    }>(key);

    if (
      cached &&
      body.phone === cached.phone &&
      cached.expiresIn > Date.now()
    ) {
      CachingService.getInstance().set(
        key,
        { ...cached, otp: body.otp },
        5 * 60,
      );
      return { ...body, expiresIn: cached.expiresIn };
    }

    throw new BadRequestException([
      { field: 'phone', message: VALIDATE_MESSAGE.ACCOUNT.PHONE_ALREADY_USED },
    ]);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Patch('reset-passcode')
  async resetPasscode(@Body() body: ResetPasscodeRequestDto) {
    this._logger.log(`resetPasscode -> body: ${JSON.stringify(body)}`);
    try {
      const output = await firstValueFrom(
        this._clientAuth.send<SigninRequestDto, SigninRequestDto>(
          MESSAGE_PATTERN.AUTH.RESET_PASSCODE,
          body,
        ),
      );
      return output;
    } catch (error) {
      return { ...error, message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID };
    }
  }

  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('change-email')
  async changeEmail(
    @Body() body: ChangeEmailRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`changeEmail -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<
      string,
      { input: ChangeEmailRequestDto; userId: string }
    >(MESSAGE_PATTERN.AUTH.CHANGE_EMAIL, { input: body, userId });
  }

  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('verify-email')
  async verifyEmail(
    @Body() body: ConfirmEmailRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`verifyEmail -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<
      string,
      { input: ConfirmEmailRequestDto; userId: string }
    >(MESSAGE_PATTERN.AUTH.CONFIRM_EMAIL, { input: body, userId });
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('contact')
  async syncContacts(
    @Body() body: SyncContactRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`syncContacts -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<
      boolean,
      SyncContactRequestDto & { id: string }
    >(MESSAGE_PATTERN.AUTH.SYNC_CONTACT, {
      ...body,
      id: userId,
    });
  }

  @UseInterceptors(AuthCacheInterceptor)
  @Get('contact')
  async getContacts(@AuthUser() { userId }: Auth) {
    this._logger.log(`getContacts -> userId: ${userId}`);
    const cache = await CachingService.getInstance().get(
      MESSAGE_PATTERN.AUTH.GET_CONTACT + userId,
    );
    if (cache) return cache;
    return this._clientAuth.send<boolean, string>(
      MESSAGE_PATTERN.AUTH.GET_CONTACT,
      userId,
    );
  }

  @UsePipes(new MainValidationPipe())
  @Patch('profile/setting' + PATH_CONTAIN_ID)
  async settingProfile(
    @Body() body: SettingAccountRequestDto,
    @Param('id') id: string,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(
      `settingProfile -> body: ${JSON.stringify(body)} id: ${id}`,
    );
    return this._clientAuth.send<
      boolean,
      SettingAccountRequestDto & { id: string; userId: string }
    >(MESSAGE_PATTERN.AUTH.PROFILE_SETTING, { ...body, id, userId });
  }

  @UsePipes(new MainValidationPipe())
  @Patch('profile/setting')
  async updateAccountSetting(
    @AuthUser() { userId }: Auth,
    @Body() body: UpdateAccountSettingBodyDto,
  ) {
    this._logger.log(`updateAccountSetting -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<
      boolean,
      { userId: string; body: UpdateAccountSettingBodyDto }
    >(MESSAGE_PATTERN.AUTH.UPDATE_ACCOUNT_SETTING, { userId, body });
  }

  @UsePipes(new MainValidationPipe())
  @Patch('device-token')
  async updateDeviceToken(
    @Body() body: UpdateDeviceTokenRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`updateDeviceToken -> body: ${JSON.stringify(body)}`);
    return this._clientAuth.send<
      boolean,
      UpdateDeviceTokenRequestDto & { id: string }
    >(MESSAGE_PATTERN.AUTH.DEVICE_TOKEN, {
      ...body,
      id: userId,
    });
  }

  @UseInterceptors(AuthCacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('transaction-history')
  async getTransactionHistory(
    @Query() query: TransactionHistoryQueryDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(
      `getTransactionHistory -> query: ${JSON.stringify(query)}`,
    );
    return this._clientAuth.send<
      boolean,
      TransactionHistoryQueryDto & { id: string }
    >(MESSAGE_PATTERN.AUTH.TRANS_HISTORY, {
      id: userId,
      ...query,
    });
  }

  @UseInterceptors(AuthCacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('notification')
  async getNotification(
    @Query() query: PaginationDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`getNotification -> query: ${JSON.stringify(query)}`);
    return this._clientAuth.send<boolean, PaginationDto & { userId: string }>(
      MESSAGE_PATTERN.AUTH.NOTIFICATION,
      {
        ...query,
        userId,
      },
    );
  }

  @Patch('notification/seen' + PATH_CONTAIN_ID)
  async updateNotification(
    @Param('id') id: string,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`updateNotification -> id: ${id}`);
    return this._clientAuth.send<boolean, { id: string; userId: string }>(
      MESSAGE_PATTERN.AUTH.SEEN_NOTIFICATION,
      {
        id,
        userId,
      },
    );
  }

  @UsePipes(new MainValidationPipe())
  @Get('notification/count')
  async countUnreadNotification(@AuthUser() { userId }: Auth) {
    this._logger.log(`getTransactionHistory -> userId: ${userId}`);
    return this._clientAuth.send<unknown, string>(
      MESSAGE_PATTERN.AUTH.COUNT_NOTIFICATION,
      userId,
    );
  }

  // Sử dụng MainValidationPipe để kiểm tra dữ liệu đầu vào từ body.
  @UsePipes(new MainValidationPipe())
  @Patch('notification/read-all')
  async readAllNotifications(
    @Req() req: Request,
    @Body() body: ReadAllNotificationRequestDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`readAllNotifications -> body: ${JSON.stringify(body)}`);
    return this._clientAuth
      .send<{ totalRecords: number }, { userId: string; at: string | Date }>(
        MESSAGE_PATTERN.AUTH.READ_ALL_NOTIFICATIONS,
        {
          userId,
          at: body.at,
        },
      )
      .pipe(
        // Dùng tap() để kiểm tra phản hồi từ microservice.
        // Nếu totalRecords > 0, nghĩa là có thông báo đã được cập nhật, thì xoá cache để đảm bảo dữ liệu cập nhật mới nhất
        tap((response) => {
          if (response?.totalRecords) {
            // Clear cache from AuthCacheInterceptor
            // Nếu người dùng đã đánh dấu tất cả thông báo là đã đọc, nhưng cache vẫn chứa dữ liệu cũ, thì người dùng sẽ tiếp tục thấy thông báo chưa đọc.
            CachingService.getInstance().delete(extractAuthCacheKey(req));
          }
        }),
      );
  }

  @Public()
  @Header('content-type', 'text/html')
  @Get('terms')
  async getTerms(@Res() res: Response) {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const url = join(process.cwd(), 'config/trustpay_tnc.html');
    return res.send(readFileSync(url, { encoding: 'utf8' }));
  }

  @UseInterceptors(CacheInterceptor)
  @Get('banners-v2')
  async getBannersV2() {
    const cache = await CachingService.getInstance().get<string[]>(
      MESSAGE_PATTERN.AUTH.BANNERS_V2,
    );
    if (cache) return cache;

    return this._clientAuth.send<string[], unknown>(
      MESSAGE_PATTERN.AUTH.BANNERS_V2,
      {},
    );
  }

  @UseInterceptors(CacheInterceptor)
  @Get('ads-banner')
  async getAdsBanner() {
    const cache = await CachingService.getInstance().get<unknown>(
      MESSAGE_PATTERN.AUTH.ADS_BANNER,
    );
    if (cache) return cache;

    return this._clientAuth.send<string[], unknown>(
      MESSAGE_PATTERN.AUTH.ADS_BANNER,
      {},
    );
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DEFAULT_EXPIRES_GET)
  @Get('ads-banner-v2')
  async getAdsBannerV2() {
    return this._clientAuth.send<string[], unknown>(
      MESSAGE_PATTERN.AUTH.ADS_BANNER_V2,
      {},
    );
  }

  @UseInterceptors(AuthCacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('referral')
  async getReferrals(
    @Query() query: ReferralQueryDto,
    @AuthUser() { userId }: Auth,
  ) {
    this._logger.log(`getReferrals -> query: ${JSON.stringify(query)}`);
    return this._clientAuth.send<
      boolean,
      { id: string; input: ReferralQueryDto }
    >(MESSAGE_PATTERN.AUTH.GET_REFERRAL_BY_ACCOUNT, {
      id: userId,
      input: query,
    });
  }
}

/*
  - Nếu controller đơn giản chỉ gửi qua rabbit MQ thì có thể viết trong controller luôn để tránh viết nhiều code.
  - Nếu controler xử lý trực tiếp thì nên đưa logic qua service để viết.
  - Hạn chế sử dụng @Res() để cho phép NestJS tự động xử lý response và tránh treo server.
  - Việc loại bỏ @Res() và @Next() giúp NestJS tự động xử lý response. Điều này làm cho mã dễ quản lý và giảm nguy cơ lỗi do quên gọi res.send() hoặc next().
*/
