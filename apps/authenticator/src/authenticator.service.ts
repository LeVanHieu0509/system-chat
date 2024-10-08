import {
  DEFAULT_EXPIRES_GET,
  MESSAGE_PATTERN,
  OTP_TYPE,
} from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CachingService } from 'libs/caching/src';
import { Account, FindAccountRequestDto, OTPRequestDto } from 'libs/dto/src';
import { MainRepo } from 'libs/repositories/main.repo';
import { UtilsService } from 'libs/utils/src';

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

  constructor(private readonly _repo: MainRepo) {} // @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,

  getHello(): string {
    return 'Hello World!';
  }

  async processOTP(input: OTPRequestDto) {
    this._logger.log(`processOTP input: ${JSON.stringify(input)}`);

    const { phone, email, type } = input;

    if (type === OTP_TYPE.SIGN_UP) {
      const isEmailExist = await this._repo
        .getAccount()
        .count({ where: { email } });

      if (isEmailExist) {
        throw new BadRequestException([
          { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_EXIST },
        ]);
      }
    }

    const key = email ? email : UtilsService.getInstance().toIntlPhone(phone);
    // const otp = await this._otp.generateOTP(key + type, type);

    // if (!otp)
    //   return new AppError(
    //     'ERR',
    //     VALIDATE_MESSAGE.TOO_MANY_REQUESTS,
    //     HttpStatus.TOO_MANY_REQUESTS,
    //   );

    const token = UtilsService.getInstance().randomToken(24);
    // CachingService.getInstance().set(token, true, this._otp.getExpires(type));
    // if (email) {
    //   MailService.getInstance().sendOTP(
    //     email,
    //     otp,
    //     OTP_CONFIG[type as OTP_TYPE].ttl.value,
    //   );
    // }
    return { token };
  }

  async getAccount(
    params: FindAccountRequestDto & { id?: string },
    profile = false,
  ) {
    //1. ghi logs
    this._logger.log(`get account Query --> ${JSON.stringify(params)}`);
    //2. create catching key
    const { email, id, phone } = params;
    const key = id
      ? id
      : phone
      ? UtilsService.getInstance().toIntlPhone(phone)
      : email;

    //3. check cache -> if exists return account
    const cachingKey = MESSAGE_PATTERN.AUTH.FIND_ACCOUNT + `${key}-${profile}`;

    let account = await CachingService.getInstance().get(cachingKey);

    if (account) return account as Account;
    else {
      //4. If not exists => query in db
      this._logger.log(JSON.stringify(cachingKey));
      account = await this._repo.getAccount().findFirst({
        where: {
          OR: [{ phone: key }, { email }, { id }],
        },
        select: {
          id: true,
          avatar: true,
          status: true,
          email: true,
          phone: true,
          emailVerified: true,
          passcode: true,
          deviceToken: true,
          fullName: true,
          referralCode: true,
          walletAddress: true,
          giftAddress: true,
          phoneVerified: profile,
          referralLink: profile,
          isPartner: profile,
          kycStatus: profile,
          createdAt: profile,
          updatedAt: profile,
          accountReferralFrom: profile && {
            select: { referralByInfo: { select: { id: true, email: true } } },
          },
          accountSetting: profile && {
            select: { receiveNotify: true, language: true },
          },
        },
      });

      // if (account['accountReferralFrom']) {
      //   account['referralBy'] = account['accountReferralFrom']?.referralByInfo;
      //   delete account['accountReferralFrom'];
      // }

      //5. save account into cache with expired after
      await CachingService.getInstance().set(
        cachingKey,
        account,
        DEFAULT_EXPIRES_GET,
      );
    }
  }

  async verifyPasscodeSignIn() {}
  async verifyPasscode() {}
  async saveAccount() {}
  async checkOTP() {}
  async checkPhone() {}
  async preCheckPhone() {}
  async resetPasscode() {}
  async signIn() {}
  async editAccount() {}
  async changeEmail() {}
  async confirmEmail() {}
  async changePhone() {}
  async confirmPhone() {}
  async syncContacts() {}
  async getContacts() {}
  async settingProfile() {}
  async updateAccountSetting() {}
  async updateDeviceToken() {}
  async getTransactionHistory() {}
  async getNotification() {}
  async updateSeenNotification() {}
  async countNotification() {}
  async readAllNotifications() {}
}
