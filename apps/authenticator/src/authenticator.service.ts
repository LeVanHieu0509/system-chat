import {
  CASHBACK_ACTION_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CURRENCY_CODE,
  DEFAULT_EXPIRES_GET,
  MESSAGE_PATTERN,
  NOTIFICATION_TYPE,
  OTP_TYPE,
  QUEUES,
  REWARD_NON_REFERRAL,
  STATUS,
} from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, PrismaPromise } from '@prisma/client';
import { isEmail, isPhoneNumber } from 'class-validator';
import { CachingService } from 'libs/caching/src';
import {
  AMOUNT_REFERRAL_BY,
  AMOUNT_REFERRAL_FROM,
  REFERRAL_CODE_LENGTH,
} from 'libs/config';
import {
  Account,
  AccountReferral,
  Auth,
  CheckPhoneRequestDto,
  FindAccountRequestDto,
  OTPRequestDto,
  SignupRequestDto,
  VerifyOTPRequestDto,
} from '@app/dto';
import {
  COMMON_NOTE_STATUS,
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
} from 'libs/notification/src/notification.description';
import { MainRepo } from 'libs/repositories/main.repo';
import { UtilsService } from 'libs/utils/src';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { OTP_CONFIG, OTPService } from '@app/otp';
import { AppError } from '@app/common';
import { MailService } from '@app/mail';

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

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    private readonly _repo: MainRepo,
    private readonly _otp: OTPService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async signInWithGoogle(accessToken: string) {
    // handle third party to get info from google.
    const googleAccount: Account = {
      email: 'levanhieu@outlook.com', //UtilsService.getInstance().randomEmail(),
      emailVerified: true,
      googleId: '12123123332122', // UtilsService.getInstance().randomToken(12),
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
    const otp = await this._otp.generateOTP(key + type, type);
    console.log({ otp });
    if (!otp)
      return new AppError(
        'ERR',
        VALIDATE_MESSAGE.TOO_MANY_REQUESTS,
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const token = UtilsService.getInstance().randomToken(24);
    CachingService.getInstance().set(token, true, this._otp.getExpires(type));

    if (email) {
      MailService.getInstance().sendOTP(
        email,
        otp,
        OTP_CONFIG[type as OTP_TYPE].ttl.value,
      );
    }
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

    // Truy vấn để lấy danh sách các đồng tiền đang hoạt động (status: STATUS.ACTIVE), chỉ lấy trường id của mỗi đồng tiền.
    const coins = await this._repo
      .getCurrency()
      .findMany({ where: { status: STATUS.ACTIVE }, select: { id: true } });

    // Duyệt qua danh sách các đồng tiền đã lấy và tạo dữ liệu để lưu lại cho tài khoản mới, với lý do "CREATE_ACCOUNT_SUCCESS".
    const coinData = coins.map((c) => ({
      currencyId: c.id,
      reason: COMMON_NOTE_STATUS.CREATE_ACCOUNT_SUCCESS,
    }));
    // const bulkOps: Operation[] = [];
    const bulkOps: PrismaPromise<any>[] = [];

    // Lấy thông tin và thời gian hiện tại
    const dailyLuckyId = UtilsService.getInstance().getDbDefaultValue().id;
    const createdAt = new Date();

    // update table account summary
    // Lấy thông tin chi tiết về ngày, tuần, tháng, năm từ thời điểm hiện tại
    const { day, week, month, year } =
      UtilsService.getInstance().getUnitDate(createdAt);

    /*
      bạn không thể sử dụng trực tiếp Prisma__AccountClient như một Operation vì nó không phải 
                  là một đối tượng thực thi mà chỉ là một biểu diễn của một truy vấn. ```q    1```các thao tác đồng thời như với bulkOps.
    */

    // bulkOps để có thể thực hiện cùng lúc với các thao tác khác nhằm cải thiện hiệu suất.
    bulkOps.push(
      // Cập nhật thông tin cho tài khoản với id là account.id
      this._repo.getAccount().update({
        where: { id: account.id },

        // Tạo mới nhiều bản ghi trong bảng cbAvailable (cashback available) với dữ liệu là coinData.
        // Đây là một cách để thêm nhiều bản ghi liên quan đến số dư hoàn tiền(cashback) của tài khoản

        // Tạo nhiều bản ghi vào bảng cashback_available mà có khoá ngoại được liên kết tới bảng account (Thực hiện insert ở bảng account luôn mới sợ)
        // cbAvailable đại diện cho một liên kết (relation) giữa bảng tài khoản và bảng hoàn tiền (cashback available).
        data: { cbAvailable: { createMany: { data: coinData } } }, //Thực hiện cập nhật tài khoản, đồng thời thêm vào thông tin về các khoản hoàn tiền mà tài khoản nhận được một cách nhanh chóng và đồng bộ.
        select: { id: true },
      }),
      this._repo.getAccountDailyLuckyWheel().create({
        // chứa thông tin về một lần quay thưởng của tài khoản người dùng
        data: {
          id: dailyLuckyId,
          accountId: account.id, // Liên kết tới tài khoản thực hiện lần quay thưởng này
          note: COMMON_NOTE_STATUS.CREATE_DAILY_LUCKY_WHEEL, // Ghi chú (ví dụ như trạng thái hoặc thông tin về lần quay).
          luckyWheelHistories: {
            luckyWheelHistories: [
              {
                note: COMMON_NOTE_STATUS.CREATE_DAILY_LUCKY_WHEEL, // Ghi chú cụ thể cho lịch sử của lần quay này
                updatedAt: createdAt.toISOString(), // Thời gian tạo bản ghi lịch sử này.
              },
            ],
          },
        },
      }),

      // thường là để thông báo cho người dùng về một sự kiện cụ thể.
      this._repo.getNotification().create({
        data: {
          ref: dailyLuckyId, // Tham chiếu đến sự kiện vòng quay may mắn hàng ngày, để xác định thông báo này thuộc về sự kiện nào.
          accountId: account.id, // Liên kết với tài khoản người dùng nhận thông báo.
          type: NOTIFICATION_TYPE.DAILY_REWARD, // Loại thông báo, ví dụ như "Phần thưởng hàng ngày" (DAILY_REWARD).
          title: COMMON_TITLE[CASHBACK_TYPE.DAILY_REWARD], // Tiêu đề thông báo, thường là mô tả ngắn gọn về nội dung thông báo.
          description: COMMON_NOTE_STATUS.CREATE_DAILY_LUCKY_WHEEL, // Mô tả chi tiết về nội dung thông báo (ví dụ như lý do và thông tin về phần thưởng).
        },
      }),

      /*
        Đây là cách để cập nhật số lần hoặc chỉ số mỗi khi sự kiện nào đó xảy ra, 
        giúp lưu giữ tổng số cho các hoạt động hàng ngày, hàng tuần hoặc hàng tháng.
      */
      this._repo.getAccountSummary().upsert({
        // day_month_year là một khóa xác định, dựa trên ngày, tháng và năm.
        // Nếu một bản ghi có giá trị ngày, tháng và năm khớp với điều kiện này thì bản ghi đó sẽ được sử dụng cho hành động update,
        // nếu không có bản ghi nào khớp thì nó sẽ create một bản ghi mới.
        where: { day_month_year: { day, month, year } },

        // Nếu không tìm thấy bản ghi nào khớp với điều kiện trong where, Prisma sẽ tạo một bản ghi mới với các thông tin
        create: { day, month, week, year, value: 1 },

        // Nếu đã có bản ghi khớp với điều kiện trong where, Prisma sẽ cập nhật bản ghi đó.
        update: { value: { increment: 1 } },
      }),
    );

    // xác định xem tài khoản mới có thông tin người giới thiệu hay không
    if (referralBy) {
      // Hàm này có nhiệm vụ tạo một mối liên kết (liên hệ) giữa người giới thiệu (referralBy) và tài khoản mới (referralFrom)
      // Điều này thường dùng để ghi nhận và quản lý các chương trình thưởng cho việc giới thiệu người dùng mới
      this.insertAccountReferral(
        { referralBy, referralFrom: account.id },
        bulkOps,
      );
    } else {
      // Hàm này có nhiệm vụ thực hiện các bước thưởng cho tài khoản mới,
      // chẳng hạn như cung cấp một phần thưởng chào mừng,
      // thêm thông tin tài khoản vào cơ sở dữ liệu, hoặc cập nhật các thông tin liên quan.
      this.rewardNewAccount(account.id, bulkOps);
    }
    return true;
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
      currencyId, //ID của loại tiền tệ - "bf36a218-48dd-4e12-a5f5-de00fd36ff43"
      // id: transactionId, //ID tài khoản nhận thưởng - "de40a3a0-8ad5-11ef-9d77-ed91ef367574"
      status: CASHBACK_STATUS.PROCESSING, // Trạng thái của giao dịch (ở đây là PROCESSING). - 1
      actionType: CASHBACK_ACTION_TYPE.ADD, // -- 10
      amount, // Số tiền thưởng. - 1000
      receiverId: accountId, // - "46147639-ce89-42d8-b5ec-eaf7ebfadfdc"
      title: COMMON_TITLE[CASHBACK_TYPE.NON_REFERRAL], // -- "Đăng ký ứng dụng Bitback."
      description: COMMON_NOTE_STATUS.NON_REFERRAL_PROCESSING, // -- "Phần thưởng sẽ có hiệu lực sau khi định danh eKYC."
      type: CASHBACK_TYPE.NON_REFERRAL,

      //Lịch sử thay đổi của cashback với ghi chú và thời gian cập nhật.
      cbHistories: {
        cbHistories: [
          {
            note: COMMON_NOTE_STATUS.NON_REFERRAL_PROCESSING, // -- "Phần thưởng sẽ có hiệu lực sau khi định danh eKYC."
            updatedAt: new Date().toISOString(), // -- "2024-10-15T09:14:23.322Z"
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
    this._logger.log(
      `rewardNewAccount --> currency: ${JSON.stringify(currency)}`,
    );
    this._logger.log(
      `rewardNewAccount --> cbTransaction: ${JSON.stringify(cbTransaction)}`,
    );

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

      // save into database
      await this._repo.transaction(bulkOps);

      // Tạo payload để gửi yêu cầu đến hệ thống ví
      const payload = { cbTransaction, version: 1 };
      this._logger.log(
        `rewardNewAccount --> payload: ${JSON.stringify(payload)}`,
      );

      // Nếu một CbTrans được tạo thì sẽ thực hiện tăng giảm số tiền thông qua service wallet.

      await firstValueFrom(
        this._clientWallet.send(
          MESSAGE_PATTERN.WALLET.NONE_ACCOUNT_REFERRAL,
          payload,
        ),
      );
    } else {
      const payload = { cbTransaction, version: 1 };
      this._logger.log(
        `rewardNewAccount --> payload: ${JSON.stringify(payload)}`,
      );
      bulkOps.push(this._repo.getCbTrans().create({ data: cbTransaction }));
      await this._repo.transaction(bulkOps);

      // Thêm thao tác tạo giao dịch cashback (cbTransaction) vào bulkOps
      await firstValueFrom(
        this._clientWallet.send(
          MESSAGE_PATTERN.WALLET.NONE_ACCOUNT_REFERRAL,
          payload,
        ),
      );

      // save into database
    }

    //để gửi thông báo cho tài khoản mới
    // this._notification.sendNotifyNewAccount([accountId], des, true);
  }

  private async insertAccountReferral(
    { referralBy, referralFrom }: AccountReferral,
    bulkOps: PrismaPromise<any>[],
  ): Promise<void> {
    // 1. get info account and config setting in database
    const [referralByInfo, referralFromInfo, config, currency] =
      await Promise.all([
        this._repo.getAccount().findUnique({
          where: { id: referralBy },
          select: {
            fullName: true,
            phone: true,
            deviceToken: true,
            cbAvailable: { select: { currencyId: true, version: true } },
          },
        }),
        this._repo.getAccount().findUnique({
          where: { id: referralFrom },
          select: {
            fullName: true,
            phone: true,
            cbAvailable: { select: { currencyId: true, version: true } },
          },
        }),
        this._repo.getConfigCommission().findFirst({
          select: { referralFrom: true, referralBy: true, needKyc: true },
          orderBy: { createdAt: 'desc' },
        }),
        this._repo
          .getCurrency()
          .findUnique({ where: { code: CURRENCY_CODE.SATOSHI } }),
      ]);

    const { id: currencyId, code: coinCode } = currency;
    const amountFrom = config ? config.referralFrom : AMOUNT_REFERRAL_FROM;
    const amountBy = config ? config.referralBy : AMOUNT_REFERRAL_BY;

    // 2. create transaction to RefBy and refFrom
    const cbTransactionFrom: Prisma.CashbackTransactionUncheckedCreateInput = {
      currencyId,
      status: CASHBACK_STATUS.PROCESSING,
      actionType: CASHBACK_ACTION_TYPE.ADD,
      amount: amountFrom,
      senderId: referralBy,
      receiverId: referralFrom,
      title: COMMON_TITLE[CASHBACK_TYPE.REFERRAL],
      description: COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.PROCESSING],
      type: CASHBACK_TYPE.REFERRAL,
      cbHistories: {
        cbHistories: [
          {
            note: COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.PROCESSING],
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    };
    const cbTransactionBy: Prisma.CashbackTransactionUncheckedCreateInput = {
      currencyId,
      status: CASHBACK_STATUS.PROCESSING,
      actionType: CASHBACK_ACTION_TYPE.ADD,
      amount: amountBy,
      senderId: referralFrom,
      receiverId: referralBy,
      title: COMMON_TITLE[CASHBACK_TYPE.REFERRAL],
      description: COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.PROCESSING],
      type: CASHBACK_TYPE.REFERRAL,
      cbHistories: {
        cbHistories: [
          {
            note: COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.PROCESSING],
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    };

    // 3. Check KYC to update status transaction
    if (config && !config.needKyc) {
      cbTransactionBy.status = cbTransactionFrom.status =
        CASHBACK_STATUS.SUCCESS;
      cbTransactionBy.description = cbTransactionFrom.description =
        COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.SUCCESS];
      cbTransactionBy.cbHistories = cbTransactionFrom.cbHistories = {
        cbHistories: [
          {
            note: COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.SUCCESS],
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      /*
        Chia version nhằm mục đích:

        1. Giúp quản lý và theo dõi sự thay đổi của dữ liệu (đặc biệt là với những dữ liệu có thể thay đổi thường xuyên).
        2. Tránh xung đột dữ liệu khi có nhiều thao tác cập nhật đồng thời
        3. Đảm bảo tính nhất quán của dữ liệu, đặc biệt là trong các giao dịch tài chính như cashback, nơi yêu cầu tính chính xác cao.
      */

      const payload = {
        accountReferral: { referralFrom, referralBy },
        cbTransactionBy,
        cbTransactionFrom,
        versionFrom: referralFromInfo.cbAvailable.find(
          (x) => x.currencyId === currencyId,
        ).version,
        versionBy: referralByInfo.cbAvailable.find(
          (x) => x.currencyId === currencyId,
        ).version,
      };

      await lastValueFrom(
        this._clientWallet.send(
          MESSAGE_PATTERN.WALLET.ACCOUNT_REFERRAL,
          payload,
        ),
      );
    } else {
      // 1. insert Account_referral
      bulkOps.push(
        this._repo.getAccountReferral().create({
          data: { referralFrom, referralBy },
          select: { createdAt: true },
        }),
      );
      // 2.1. insert cashback_transaction with status=1
      bulkOps.push(
        this._repo.getCbTrans().create({ data: cbTransactionFrom }),
        this._repo.getCbTrans().create({ data: cbTransactionBy }),
      );
    }

    const descriptionFrom = NOTIFY_DESCRIPTION.REFERRAL_FROM.replace(
      '$name',
      referralByInfo.fullName || referralByInfo.phone,
    ).replace(
      '$value',
      Intl.NumberFormat().format(amountFrom) + ` ${coinCode}`,
    );

    const descriptionBy = NOTIFY_DESCRIPTION.REFERRAL_BY.replace(
      '$name',
      referralFromInfo.fullName || referralFromInfo.phone,
    ).replace('$value', Intl.NumberFormat().format(amountBy) + ` ${coinCode}`);

    // 2.2 insert and send notification
    // const setting = await this.checkNotificationSetting(referralBy);
    const data = [
      {
        type: NOTIFICATION_TYPE.REFERRAL_FROM,
        description: descriptionFrom,
        title: COMMON_TITLE[CASHBACK_TYPE.REFERRAL],
        accountId: referralFrom,
        ref: referralFrom,
      },
      {
        type: NOTIFICATION_TYPE.REFERRAL_BY,
        description: descriptionBy,
        title: COMMON_TITLE[CASHBACK_TYPE.REFERRAL],
        accountId: referralBy,
        ref: referralFrom,
      },
    ];

    bulkOps.push(
      this._repo.getAccountReferralStats().upsert({
        where: { accountId: referralBy },
        create: { totalReferrals: 1, accountId: referralBy },
        update: { totalReferrals: { increment: 1 } },
        select: { updatedAt: true },
      }),
    );
    bulkOps.push(this._repo.getNotification().createMany({ data }));
    await this._repo.transaction(bulkOps);
    // if (referralByInfo.deviceToken) this._notification.sendNotifyNewAccount([referralBy], data[1].description);
  }

  async confirmPhone(id: string) {
    this._logger.log(`confirmPhone id: ${id}`);
    const account = await this._repo
      .getAccount()
      .findUnique({ where: { id }, select: { histories: true } });

    const { histories: accountHistories } = account;
    const { histories = [] } =
      (accountHistories as { histories: Record<string, unknown>[] }) || {};
    histories.push({
      updatedAt: new Date().toISOString(),
      reason: REASON.CONFIRM_PHONE,
    });

    await this._repo.getAccount().update({
      where: { id },
      data: { phoneVerified: true, histories: account.histories },
      select: { updatedAt: true },
    });
    return { status: true };
  }

  async changePhone(phoneInput: string, id: string) {
    this._logger.log(`confirmEmail id: ${id} phone: ${phoneInput}`);

    const phone = UtilsService.getInstance().toIntlPhone(phoneInput);

    const phoneExist = await this._repo
      .getAccount()
      .count({ where: { phone } });
    if (phoneExist) {
      throw new BadRequestException([
        { field: 'phone', message: VALIDATE_MESSAGE.ACCOUNT.PHONE_EXIST },
      ]);
    }

    const account = await this._repo
      .getAccount()
      .findUnique({ where: { id }, select: { histories: true } });
    const { histories: accountHistories } = account;
    const { histories = [] } =
      (accountHistories as { histories: Record<string, unknown>[] }) || {};
    histories.push({
      updatedAt: new Date().toISOString(),
      reason: REASON.CHANGE_PHONE,
    });

    await this._repo.getAccount().update({
      where: { id },
      data: { phone, phoneVerified: false, histories: account.histories },
      select: { updatedAt: true },
    });
    CachingService.getInstance().delete(`PRE-CHECK-PHONE-${phoneInput}`);

    return { status: true };
  }

  async checkOTP(input: VerifyOTPRequestDto) {
    this._logger.log(`checkOTP input: ${JSON.stringify(input)}`);

    const { otp, phone, email, type, token } = input;

    const cache = await CachingService.getInstance().get(token);

    if (!cache)
      throw new BadRequestException([
        { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
      ]);

    const key = email ? email : UtilsService.getInstance().toIntlPhone(phone);

    const valid = await this._otp.verifyOTP(key + type, otp, type);
    if (!valid)
      throw new BadRequestException([
        { field: 'otp', message: VALIDATE_MESSAGE.ACCOUNT.OTP_INVALID },
      ]);

    CachingService.getInstance().delete(token);
    const tokenString = UtilsService.getInstance().randomToken(24);
    CachingService.getInstance().set(
      tokenString,
      true,
      this._otp.getExpires(type),
    );
    return { token: tokenString };
  }

  async verifyPasscode() {}

  // Hàm checkPhone được thiết kế để kiểm tra xem số điện thoại đã tồn tại trong hệ thống hay chưa,
  // ngoại trừ số của chính người dùng đang thực hiện yêu cầu.
  async checkPhone(input: CheckPhoneRequestDto & Auth) {
    this._logger.log(`checkPhone input: ${JSON.stringify(input)}`);

    const { userId, phone } = input;

    return this._repo
      .getAccount()
      .count({
        where: {
          id: { not: userId },
          phone: UtilsService.getInstance().toIntlPhone(phone),
        },
      })
      .then((count) => !!count);
  }

  async preCheckPhone(input: CheckPhoneRequestDto & Auth) {
    this._logger.log(`preCheckPhone input: ${JSON.stringify(input)}`);

    const { userId, phone } = input;

    const existPhone = await this._repo
      .getAccount()
      .count({
        where: {
          id: { not: userId },
          phone: UtilsService.getInstance().toIntlPhone(phone),
        },
      });

    if (existPhone)
      throw new BadRequestException([
        {
          field: 'phone',
          message: VALIDATE_MESSAGE.ACCOUNT.PHONE_ALREADY_USED,
        },
      ]);

    const expiresIn = UtilsService.getInstance()
      .toDayJs(Date.now())
      .add(5, 'minute')
      .valueOf();

    CachingService.getInstance().set(
      `PRE-CHECK-PHONE-${userId}`,
      { expiresIn, phone },
      5 * 60,
    );

    return { expiresIn };
  }
  async resetPasscode() {}
  async signIn() {}
  async editAccount() {}
  async changeEmail() {}
  async confirmEmail() {}
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
