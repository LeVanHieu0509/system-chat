import { MESSAGE_PATTERN, QUEUES, STATUS } from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { CachingService } from 'libs/caching/src';
import {
  CMS_JWT_EXPIRATION_TIME,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_REFRESH_TOKEN_KEY,
  JWT_SECRET_KEY,
} from 'libs/config';
import {
  AccessTokenRequestDto,
  Account,
  AccountDto,
  FindAccountRequestDto,
  OTPRequestDto,
  OTPTypeRequestDto,
  RefreshTokenRequestDto,
  SignupRequestDto,
  TokenPayloadDto,
  VerifyPasscodeSigninRequestDto,
} from '@app/dto';
import { firstValueFrom, last, lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);

  // Sử dụng dependency injection để inject đối tượng ClientProxy tương ứng với hàng đợi (queue) xác thực (AUTHENTICATOR) vào controller.
  // Điều này giúp controller có thể gửi tin nhắn qua RabbitMQ đến các microservice khác.

  constructor(
    private readonly _jwtService: JwtService,

    // @Inject(QUEUES.AUTHENTICATOR) được sử dụng để inject provider authenticatorQueueProvider vào AuthService.
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
  ) {}

  async sendOtpRequest(body: OTPRequestDto & OTPTypeRequestDto): Promise<any> {
    return this._clientAuth.send<boolean, OTPRequestDto & OTPTypeRequestDto>(
      MESSAGE_PATTERN.AUTH.REQUEST_OTP,
      body,
    );
  }

  async getAccount(
    body: FindAccountRequestDto & { id?: string },
  ): Promise<any> {
    return this._clientAuth.send<
      boolean,
      FindAccountRequestDto & { id?: string }
    >(MESSAGE_PATTERN.AUTH.FIND_ACCOUNT, body);
  }

  async signInWithGoogle(body: AccessTokenRequestDto) {
    const account = await lastValueFrom(
      this._clientAuth.send<AccountDto, string>(
        MESSAGE_PATTERN.AUTH.SIGN_IN_WITH_GOOGLE,
        body.accessToken,
      ),
    );

    if (account.status == STATUS.INACTIVE) {
      return new UnauthorizedException([
        { field: 'account', message: 'ACCOUNT_TEMPORARILY_LOCKED' },
      ]).getResponse();
    }

    return account;
  }

  async verifyPasscodeSignUp(body: SignupRequestDto) {
    //1. check if the pass code token exists in cache
    const checkToken = await CachingService.getInstance().get(
      MESSAGE_PATTERN.AUTH.SIGN_UP_VERIFY_PASSCODE + body.token,
    );

    if (!checkToken) {
      throw new BadRequestException([
        { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
      ]);
    }

    const account = await lastValueFrom(
      this._clientAuth.send(MESSAGE_PATTERN.AUTH.SIGN_UP_VERIFY_PASSCODE, body),
    );

    if (!account) {
      throw new UnauthorizedException('INVALID_CREDENTIALS').getResponse();
    }

    if (account['error']) return account;

    CachingService.getInstance().delete(body.token);

    // Khi gọi hàm emit(), bạn không cần phải đợi kết quả trả về mà chỉ cần phát đi sự kiện, và các dịch vụ khác sẽ lắng nghe và xử lý sự kiện đó.
    //  Thích hợp để xử lý các sự kiện như cập nhật, tạo mới, thông báo thay đổi.

    this._clientAuth.emit<string, Account>(
      MESSAGE_PATTERN.AUTH.SAVE_NEW_ACCOUNT,
      account,
    );

    return this.processLogin(account);
  }

  async verifyPasscodeSignIn(body: VerifyPasscodeSigninRequestDto) {
    const { passcode, token } = body;
    let id: string;
    try {
      let account = this._jwtService.decode(token);
      if (account && account['id']) id = account['id'];

      if (!id) {
        const caching = await CachingService.getInstance().get(
          MESSAGE_PATTERN.AUTH.SIGN_IN_VERIFY_PASSCODE + token,
        );
        if (!caching) {
          throw new BadRequestException([
            { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
          ]);
        }
        id = caching['id'];
      }

      account = await firstValueFrom(
        this._clientAuth.send<AccountDto, { id: string; passcode: string }>(
          MESSAGE_PATTERN.AUTH.SIGN_IN_VERIFY_PASSCODE,
          {
            id,
            passcode,
          },
        ),
      );
      if (!account) {
        return new BadRequestException([
          {
            field: 'passcode',
            message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID,
          },
        ]).getResponse();
      }
      if (account['error']) return account;
      CachingService.getInstance().delete(
        MESSAGE_PATTERN.AUTH.SIGN_IN_VERIFY_PASSCODE + token,
      );
      return this.processLogin(account);
    } catch {
      return new UnauthorizedException('INVALID_CREDENTIALS').getResponse();
    }
  }

  async refreshToken(query: RefreshTokenRequestDto) {
    try {
      const cache = this._jwtService.verify<{ id: string; phone: string }>(
        query.token,
        {
          jwtid: JWT_REFRESH_TOKEN_KEY,
        },
      );
      if (!cache)
        throw new BadRequestException([
          { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
        ]);
      this._logger.log(`refreshToken --> cache: ${JSON.stringify(cache)}`);

      const tokenFromCache = await CachingService.getInstance().get(
        `BITBACK-REFRESH-${cache.id}`,
      );
      if (tokenFromCache !== query.token)
        return new UnauthorizedException('INVALID_CREDENTIALS').getResponse();

      const account = await firstValueFrom(
        this._clientAuth.send<Account, string>(
          MESSAGE_PATTERN.AUTH.GET_PROFILE,
          cache.id,
        ),
      );

      if (!account)
        return new UnauthorizedException('INVALID_CREDENTIALS').getResponse();
      if (account['error']) return account;

      // Khi refresh thì sẽ set lại cặp accessToken và refresh Token mới. Nếu muốn refresh tiếp thì cần sài bộ key mới.
      return this.processLogin(account);
    } catch (err) {
      throw new BadRequestException([
        { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
      ]);
    }
  }

  private processLogin(account: {
    id?: string;
    phone?: string;
    email?: string;
    status?: number;
  }) {
    // Nếu trạng thái của tài khoản (account.status) là
    // STATUS.INACTIVE, nghĩa là tài khoản bị khóa tạm thời, hàm sẽ trả về thông báo lỗi
    // UnauthorizedException với thông tin tài khoản bị khóa
    if (account.status === STATUS.INACTIVE) {
      return new UnauthorizedException([
        { field: 'account', message: 'ACCOUNT_TEMPORARILY_LOCKED' },
      ]).getResponse();
    }
    const expiresIn = CMS_JWT_EXPIRATION_TIME; // Thời gian tồn tại của accessToken
    const refreshExpiresIn = JWT_REFRESH_TOKEN_EXPIRATION_TIME; // Thời gian tồn tại của refreshToken

    // payload là dữ liệu chứa thông tin người dùng (id, phone, email) được nhúng vào token
    const payload = {
      id: account.id,
      phone: account.phone,
      email: account.email,
    };
    this._logger.log(`payload --> ${JSON.stringify(payload)}`);
    this._logger.log(`JWT_SECRET_KEY --> ${JWT_SECRET_KEY}`);
    this._logger.log(`JWT_REFRESH_TOKEN_KEY --> ${JWT_REFRESH_TOKEN_KEY}`);

    //accessToken  được tạo bằng cách sử dụng payload với các thông tin cần thiết của tài khoản
    const accessToken = this._jwtService.sign(payload);
    // refreshToken cũng được tạo từ payload với một số thông tin bổ sung
    const refreshToken = this._jwtService.sign(payload, {
      issuer: 'BITBACK',
      jwtid: JWT_REFRESH_TOKEN_KEY,
      expiresIn: refreshExpiresIn,
    });
    CachingService.getInstance().set(
      `BITBACK-${account.id}`,
      accessToken,
      expiresIn,
    );
    CachingService.getInstance().set(
      `BITBACK-REFRESH-${account.id}`,
      refreshToken,
      refreshExpiresIn,
    );
    const output: TokenPayloadDto = { accessToken, expiresIn, refreshToken };
    return output;
  }
}
