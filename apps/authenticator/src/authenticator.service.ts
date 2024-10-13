import {
  CASHBACK_ACTION_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CURRENCY_CODE,
  DEFAULT_EXPIRES_GET,
  MESSAGE_PATTERN,
  NOTIFICATION_TYPE,
  OTP_TYPE,
  REWARD_NON_REFERRAL,
  STATUS,
} from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { isEmail, isPhoneNumber } from 'class-validator';
import { CachingService } from 'libs/caching/src';
import { REFERRAL_CODE_LENGTH } from 'libs/config';
import {
  Account,
  FindAccountRequestDto,
  OTPRequestDto,
  SignupRequestDto,
} from 'libs/dto/src';
import {
  COMMON_NOTE_STATUS,
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
} from 'libs/notification/src/notification.description';
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
  ): Promise<Account> {
    this._logger.log(`getAccount query: ${JSON.stringify(params)}`);

    const { phone, email, id } = params;
    const key = id
      ? id
      : phone
      ? UtilsService.getInstance().toIntlPhone(phone)
      : email;
    const cachingKey = MESSAGE_PATTERN.AUTH.FIND_ACCOUNT + `${key}-${profile}`;

    let account = await CachingService.getInstance().get(cachingKey);
    if (account) return account as Account;
    else {
      account = await this._repo.getAccount().findFirst({
        where: { OR: [{ phone: key }, { email }, { id }] },
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
      account['referralBy'] = account['accountReferralFrom']?.referralByInfo;
      delete account['accountReferralFrom'];
      CachingService.getInstance().set(
        cachingKey,
        account,
        DEFAULT_EXPIRES_GET,
      );
      return (account ? account : {}) as Account;
    }
  }

  async saveAccount(input: Account) {
    this._logger.log(`saveAccount account: ${JSON.stringify(input)}`);

    const { referralBy, ...account } = input;

    const coins = await this._repo
      .getCurrency()
      .findMany({ where: { status: STATUS.ACTIVE }, select: { id: true } });
    const coinData = coins.map((c) => ({
      currencyId: c.id,
      reason: COMMON_NOTE_STATUS.CREATE_ACCOUNT_SUCCESS,
    }));
    // const bulkOps: Operation[] = [];
    const bulkOps: PrismaPromise<any>[] = [];

    const dailyLuckyId = UtilsService.getInstance().getDbDefaultValue().id;
    const createdAt = new Date();
    // update table account summary
    const { day, week, month, year } =
      UtilsService.getInstance().getUnitDate(createdAt);

    /*
      bạn không thể sử dụng trực tiếp Prisma__AccountClient như một Operation vì nó không phải 
      là một đối tượng thực thi mà chỉ là một biểu diễn của một truy vấn. 
      Bạn cần chuyển đổi nó thành một Promise trước khi có thể sử dụng trong các thao tác đồng thời như với bulkOps.
    */

    // bulkOps để có thể thực hiện cùng lúc với các thao tác khác nhằm cải thiện hiệu suất.
    bulkOps.push(
      this._repo.getAccount().update({
        where: { id: account.id },
        data: { cbAvailable: { createMany: { data: coinData } } },
        select: { id: true },
      }),
      this._repo.getAccountDailyLuckyWheel().create({
        data: {
          id: dailyLuckyId,
          accountId: account.id,
          note: COMMON_NOTE_STATUS.CREATE_DAILY_LUCKY_WHEEL,
          luckyWheelHistories: {
            luckyWheelHistories: [
              {
                note: COMMON_NOTE_STATUS.CREATE_DAILY_LUCKY_WHEEL,
                updatedAt: createdAt.toISOString(),
              },
            ],
          },
        },
      }),
      this._repo.getNotification().create({
        data: {
          ref: dailyLuckyId,
          accountId: account.id,
          type: NOTIFICATION_TYPE.DAILY_REWARD,
          title: COMMON_TITLE[CASHBACK_TYPE.DAILY_REWARD],
          description: COMMON_NOTE_STATUS.CREATE_DAILY_LUCKY_WHEEL,
        },
      }),
      this._repo.getAccountSummary().upsert({
        where: { day_month_year: { day, month, year } },
        create: { day, month, week, year, value: 1 },
        update: { value: { increment: 1 } },
      }),
    );

    // xác định xem tài khoản mới có thông tin người giới thiệu hay không
    if (referralBy) {
      // Hàm này có nhiệm vụ tạo một mối liên kết (liên hệ) giữa người giới thiệu (referralBy) và tài khoản mới (referralFrom)
      // Điều này thường dùng để ghi nhận và quản lý các chương trình thưởng cho việc giới thiệu người dùng mới
      // this.insertAccountReferral(
      //   { referralBy, referralFrom: account.id },
      //   bulkOps,
      // );
    } else {
      // Hàm này có nhiệm vụ thực hiện các bước thưởng cho tài khoản mới,
      // chẳng hạn như cung cấp một phần thưởng chào mừng,
      // thêm thông tin tài khoản vào cơ sở dữ liệu, hoặc cập nhật các thông tin liên quan.
      this.rewardNewAccount(account.id, bulkOps);
    }
    return true;
  }

  async signInWithGoogle(accessToken: string) {
    // handle third party to get info from google.
    const googleAccount: Account = {
      email: UtilsService.getInstance().randomEmail(),
      emailVerified: true,
      googleId: UtilsService.getInstance().randomToken(12),
      avatar: 'https://levanhieu@',
      fullName: 'Le Van hieu',
    };

    if (!googleAccount) {
      throw new BadRequestException([
        {
          field: 'accessToken',
          message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID,
        },
      ]);
    }

    return this.processSignInWithThirdParty(googleAccount);
  }

  private async processSignInWithThirdParty(newAccount: Account) {
    this._logger.log(
      `processSignInWithThirdParty newAccount: ${JSON.stringify(newAccount)}`,
    );

    // Token này sẽ dùng để xác thực phiên đăng nhập của người dùng.
    const token = UtilsService.getInstance().randomToken(24);
    const { appleId, googleId, facebookId } = newAccount;

    // found account in database
    const account = await this._repo.getAccount().findFirst({
      where: {
        OR: [{ email: newAccount.email }, { appleId, facebookId, googleId }],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        avatar: true,
        emailVerified: true,
        status: true,
      },
    });

    // Nếu tồn tại, chỉ lấy các thông tin như id, email, phone, v.v.
    if (account) {
      // Lưu tài khoản vào cache với token mới tạo, thời gian tồn tại là 600 giây (10 phút).
      // Điều này giúp quá trình xác thực trong lần đăng nhập tiếp theo nhanh hơn mà không cần phải truy vấn cơ sở dữ liệu.
      CachingService.getInstance().set(
        MESSAGE_PATTERN.AUTH.SIGN_IN_VERIFY_PASSCODE + token,
        account,
        600,
      );

      /*
        Nếu email đã được xác minh (emailVerified), thì bỏ qua thông tin email.
        Email của người dùng đã được xác thực và không cần thay đổi.
        Giúp tránh trường hợp vô tình ghi đè hoặc làm mất đi email đã được xác minh.
        Tránh hệ thống có thể ghi đè lên email đã được xác minh, và có thể làm ảnh hưởng tới tính nhất quán và bảo mật của hệ thống.

        Việc đặt newAccount.email = undefined là một cách giúp bảo vệ thông tin email của người dùng đã được xác minh, 
        tránh cập nhật dư thừa và giảm thiểu rủi ro về bảo mật. 
        Điều này đảm bảo tính nhất quán và an toàn cho dữ liệu người dùng trong hệ thống.
     */

      if (account.emailVerified) newAccount.email = undefined;

      // Sử dụng setTimeout để cập nhật các thông tin mới vào tài khoản trong cơ sở dữ liệu sau 100 ms.
      // Điều này nhằm tránh chờ đợi cập nhật khi trả về kết quả.

      /*
        1. Kết quả sẽ được trả về cho người dùng ngay lập tức, giúp giảm thời gian chờ đợi cho người dùng
        2. Mục đích của việc dùng setTimeout là để đẩy việc cập nhật cơ sở dữ liệu ra khỏi luồng chính của quá trình xử lý.
        3. Giảm thiểu tình trạng "thắt cổ chai" khi có nhiều yêu cầu đồng thời
        4. Tăng tốc độ phản hồi, tối ưu hóa hiệu suất xử lý, giảm tải cho cơ sở dữ liệu, và đảm bảo trải nghiệm người dùng mượt mà hơn
      */
      setTimeout(async () => {
        await this._repo
          .getAccount()
          .update({ where: { id: account.id }, data: newAccount });
      }, 100);

      return { ...account, signInToken: token, isNewUser: false };
    } else {
      CachingService.getInstance().set(
        MESSAGE_PATTERN.AUTH.SIGN_UP_VERIFY_PASSCODE + token,
        newAccount,
        600,
      );
      return { signUpToken: token, isNewUser: true };
    }
  }

  private async generateReferral() {
    const referralCode =
      UtilsService.getInstance().randomAlphanumeric(REFERRAL_CODE_LENGTH);
    const exit = await this._repo
      .getAccount()
      .count({ where: { referralCode } });
    if (exit) return await this.generateReferral();
    return referralCode;
  }

  async validateSignUp(input: SignupRequestDto) {
    this._logger.log(`validateSignUp input: ${JSON.stringify(input)}`);

    const { token, referralBy, passcode, ...accountInput } = input;
    const account = await CachingService.getInstance().get<Account>(
      MESSAGE_PATTERN.AUTH.SIGN_UP_VERIFY_PASSCODE + token,
    );

    Object.assign(account, accountInput);

    // validate referral
    let referralById = undefined;
    if (referralBy) {
      const where: Prisma.AccountWhereInput = {};
      if (isPhoneNumber(referralBy, 'VN') && referralBy !== account.phone) {
        where.phone = UtilsService.getInstance().toIntlPhone(referralBy);
      } else if (isEmail(referralBy)) {
        where.email = referralBy;
      } else {
        where.referralCode = referralBy;
      }
      const accountReferral = await this._repo.getAccount().findFirst({
        where,
        select: { id: true },
      });
      if (!accountReferral) {
        throw new BadRequestException([
          {
            field: 'referralBy',
            message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID,
          },
        ]);
      }
      referralById = accountReferral.id;
    }
    if (account.phone) {
      account.phone = UtilsService.getInstance().toIntlPhone(account.phone);
      const existAccount = await this._repo
        .getAccount()
        .count({ where: { phone: account.phone } });

      if (existAccount) {
        throw new BadRequestException([
          { field: 'phone', message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID },
        ]);
      }
    }

    if (account.email) {
      const exist = await this._repo
        .getAccount()
        .count({ where: { email: account.email } });
      if (exist) {
        throw new BadRequestException([
          { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_EXIST },
        ]);
      }
    }
    account.status = STATUS.ACTIVE;
    // account.referralCode = await this.generateReferral();
    account.passcode = UtilsService.getInstance().hashValue(passcode);
    account.histories = {
      histories: [
        {
          reason: COMMON_NOTE_STATUS.CREATE_ACCOUNT_SUCCESS,
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    account.id = (
      await this._repo
        .getAccount()
        .create({ data: account, select: { id: true } })
    ).id;
    if (referralById) account.referralBy = referralById;
    return account;
  }

  // nó thực hiện việc cấp thưởng cho một tài khoản mới mà không có người giới thiệu
  private async rewardNewAccount(
    accountId: string,
    bulkOps: PrismaPromise<any>[],
  ) {
    /*
      1. Lấy thông tin tiền tệ (ví dụ: Satoshi) từ bảng Currency
      2. Lấy thông tin cấu hình thưởng từ bảng ConfigCommission

      3. Thực hiện việc thưởng cho một tài khoản mới không có người giới thiệu
      4. Sử dụng Promise.all để lấy thông tin tiền tệ và cấu hình thưởng cùng lúc
      5. Tạo đối tượng giao dịch cashback (cbTransaction) để ghi lại thông tin
      6. Tạo thông báo cho tài khoản mới.
      7. Tùy theo điều kiện KYC, tạo hoặc cập nhật giao dịch cashback và xử lý tiếp
      8. bulkOps được sử dụng để thực hiện các thao tác đồng bộ nhằm tối ưu hóa hiệu suất và tránh lặp lại truy vấn cơ sở dữ liệu
    */
    const [currency, config] = await Promise.all([
      this._repo.getCurrency().findUnique({
        where: { code: CURRENCY_CODE.SATOSHI },
        select: { id: true, code: true },
      }),
      this._repo.getConfigCommission().findFirst({
        select: { nonReferral: true, needKyc: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const { id: currencyId, code: coinCode } = currency;

    // Giá trị của phần thưởng. Nếu cấu hình có config.nonReferral, sử dụng giá trị đó, nếu không thì sử dụng giá trị mặc định REWARD_NON_REFERRAL.
    const amount = config ? config.nonReferral : REWARD_NON_REFERRAL;

    //Tạo ID giao dịch mới.
    const transactionId = UtilsService.getInstance().getDbDefaultValue().id;

    // Tạo đối tượng giao dịch cashback (cbTransaction) để ghi lại các thông tin như
    const cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput = {
      currencyId, //ID của loại tiền tệ
      id: transactionId, //ID tài khoản nhận thưởng
      status: CASHBACK_STATUS.PROCESSING, // Trạng thái của giao dịch (ở đây là PROCESSING).
      actionType: CASHBACK_ACTION_TYPE.ADD,
      amount, // Số tiền thưởng.
      receiverId: accountId,
      title: COMMON_TITLE[CASHBACK_TYPE.NON_REFERRAL],
      description: COMMON_NOTE_STATUS.NON_REFERRAL_PROCESSING,
      type: CASHBACK_TYPE.NON_REFERRAL,

      //Lịch sử thay đổi của cashback với ghi chú và thời gian cập nhật.
      cbHistories: {
        cbHistories: [
          {
            note: COMMON_NOTE_STATUS.NON_REFERRAL_PROCESSING,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    };

    //  Tạo thông báo với giá trị phần thưởng và mã tiền tệ
    const des = NOTIFY_DESCRIPTION.NON_REFERRAL.replace(
      '$value',
      `${Intl.NumberFormat().format(amount)} ${coinCode}`,
    );

    // Thêm thao tác tạo thông báo cho người dùng vào bulkOps
    bulkOps.push(
      this._repo.getNotification().create({
        data: {
          accountId,
          description: des,
          ref: transactionId,
          type: NOTIFICATION_TYPE.NON_REFERRAL,
          title: COMMON_TITLE[CASHBACK_TYPE.NON_REFERRAL],
        },
      }),
    );

    // Nếu không cần KYC (!config.needKyc)
    this._logger.log(`rewardNewAccount --> config: ${JSON.stringify(config)}`);

    if (config && !config.needKyc) {
      cbTransaction.status = CASHBACK_STATUS.SUCCESS; // Đặt trạng thái giao dịch cashback thành SUCCESS

      // Cập nhật lịch sử cashback và mô tả thành SUCCESS.
      cbTransaction.description =
        COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.SUCCESS];
      cbTransaction.cbHistories = {
        cbHistories: [
          {
            note: COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.SUCCESS],
            updatedAt: new Date().toISOString(),
          },
        ],
      };
      await this._repo.transaction(bulkOps);

      // Tạo payload để gửi yêu cầu đến hệ thống ví
      const payload = { cbTransaction, version: 1 };
      this._logger.log(
        `rewardNewAccount --> payload: ${JSON.stringify(payload)}`,
      );
      // await this._clientWallet.send(MESSAGE_PATTERN.WALLET.NONE_ACCOUNT_REFERRAL, payload).toPromise();
    } else {
      // Thêm thao tác tạo giao dịch cashback (cbTransaction) vào bulkOps
      bulkOps.push(this._repo.getCbTrans().create({ data: cbTransaction }));
      await this._repo.transaction(bulkOps);
    }

    //để gửi thông báo cho tài khoản mới
    // this._notification.sendNotifyNewAccount([accountId], des, true);
  }

  async verifyPasscodeSignIn(id: string, passcode: string) {
    this._logger.log(`verifyPasscodeSignIn id: ${id} passcode: ${passcode}`);

    const account = await this._repo.getAccount().findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        email: true,
        passcode: true,
        status: true,
      },
    });
    if (
      account &&
      UtilsService.getInstance().compareHash(passcode, account.passcode)
    ) {
      account.passcode = undefined;
      return account;
    }
    return null;
  }
  async verifyPasscode() {}
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
