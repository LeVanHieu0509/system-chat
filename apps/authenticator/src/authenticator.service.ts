import { QUEUES } from '@app/common';
import { OTP_TYPE } from '@app/common/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OTPRequestDto } from 'libs/dto/src';

const HiddenChar = '*********';
const REASON = {
  RESET_PASSCODE: 'Đặt lại mật khẩu.',
  CHANGE_KYC_STATUS: 'Cập nhập trạng thái eKYC.',
  CHANGE_EMAIL: 'Cập nhập đổi Email.',
  CONFIRM_EMAIL: 'Xác thực email',
  CHANGE_PHONE: 'Cập nhập đổi số điện thoại.',
  CONFIRM_PHONE: 'Xác thực số điện thoại.',
};

@Injectable()
export class AuthenticatorService {
  private readonly _logger: Logger = new Logger(AuthenticatorService.name);

  constructor() {} // @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,

  getHello(): string {
    return 'Hello World!';
  }

  async processOTP(input: OTPRequestDto) {
    this._logger.log(`processOTP input: ${JSON.stringify(input)}`);

    const { phone, email, type } = input;

    if (type === OTP_TYPE.SIGN_UP) {
      // const isEmailExist = await this._repo
      //   .getAccount()
      //   .count({ where: { email } });
      // if (isEmailExist) {
      //   throw new BadRequestException([
      //     { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_EXIST },
      //   ]);
      // }
    }

    // const key = email ? email : UtilsService.getInstance().toIntlPhone(phone);
    // const otp = await this._otp.generateOTP(key + type, type);

    // if (!otp)
    //   return new AppError(
    //     'ERR',
    //     VALIDATE_MESSAGE.TOO_MANY_REQUESTS,
    //     HttpStatus.TOO_MANY_REQUESTS,
    //   );

    // const token = UtilsService.getInstance().randomToken(24);
    // CachingService.getInstance().set(token, true, this._otp.getExpires(type));
    // if (email) {
    //   MailService.getInstance().sendOTP(
    //     email,
    //     otp,
    //     OTP_CONFIG[type as OTP_TYPE].ttl.value,
    //   );
    // }
    // return { token };

    return {
      token: '1312313123123123',
    };
  }
}
