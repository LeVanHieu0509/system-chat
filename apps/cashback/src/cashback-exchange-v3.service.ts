import { CachingService } from '@app/caching';
import {
  CASHBACK_ACTION_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CURRENCY_CODE,
  CurrencyLimitSettingType,
  EXCHANGE_METHOD,
  GMT_7,
  MESSAGE_PATTERN,
  QUEUES,
  STATUS,
  VNDC_RESPONSE_OFF_CHAIN_CODE,
} from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  ExchangeV3InquiryDto,
  ExchangeV3SubmitDto,
  ExchangeV3VerifyPasscodeDto,
  VNDCSendOffChainBody,
} from '@app/dto';
import {
  COMMON_DESCRIPTION,
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
} from '@app/notification';
import { MainRepo } from '@app/repositories/main.repo';
import { UtilsService } from '@app/utils';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CashbackTransaction, Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { LoggerService, VNDCService } from 'libs/plugins';
import { join } from 'path';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { InquiryDto } from './common';
import { CB_EXCHANGE_INQUIRY_SQL } from './common/sql';

type ExchangeCaching = {
  method: EXCHANGE_METHOD;
  verifyPasscode: boolean;
  amount: number;
  receiverInfo: string;
  currency: { id: string; code: string };
};
type VNDCOffChainOptions = {
  accountId: string;
  currency: { id: string; code: string };
  amount: number;
  receiverInfo: string;
};
type CBAvailable = {
  id: string;
  deviceToken: string;
  receiveNotify: boolean;
  amount: number;
  incoming: number;
  outgoing: number;
  balance: number;
  version: number;
};

type CurrentBalance = { amount: number; currencyId: string; version: number };
type WalletPayload = {
  accountId: string;
  cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput;
  cbAvailable: CurrentBalance;
};

const TOKEN_EXPIRES_SECONDS = 60 * 60; // 1 hour

/*
  Class CashbackExchangeV3Service bao gồm các hàm xử lý toàn bộ quy trình từ kiểm tra tính hợp lệ, 
  xác minh mã xác thực, thực hiện giao dịch và thông báo trạng thái cho giao dịch cashback. 
  Mỗi hàm đảm nhiệm các nhiệm vụ cụ thể để kiểm tra các điều kiện, lưu trữ tạm, và đảm bảo rằng giao dịch diễn ra an toàn.
*/
@Injectable()
export class CashbackExchangeV3Service {
  private readonly _logger = new LoggerService(CashbackExchangeV3Service.name);

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    private readonly _repo: MainRepo,
    private readonly _vndc: VNDCService,
  ) {}

  // Đoạn mã inquiry xử lý yêu cầu kiểm tra tính hợp lệ của giao dịch trước khi thực hiện chuyển tiền.
  async inquiry(accountId: string, input: ExchangeV3InquiryDto) {
    const { method, currency: currencyCode, receiverInfo, amount } = input;

    // 1. Lấy thông tin cấu hình về hạn mức tối thiểu và tối đa cho việc rút tiền của loại tiền tệ được yêu cầu
    const amountConfig =
      await this.getWithdrawLimitSettingByCurrency(currencyCode);

    // 2. Check amount config
    if (amount < amountConfig.min) {
      throw new BadRequestException([
        {
          field: 'amount',
          message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID_MIN,
        },
      ]);
    }
    if (amount > amountConfig.max) {
      throw new BadRequestException([
        {
          field: 'amount',
          message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID_MAX,
        },
      ]);
    }

    // 3. Xác minh loại tiền tệ có được hỗ trợ không
    const currency = await this._repo.getCurrency().findFirst({
      where: { code: currencyCode, status: STATUS.ACTIVE },
      select: { id: true, code: true },
    });
    if (!currency) {
      throw new BadRequestException([
        { field: 'currencyId', message: 'CURRENCY_NOT_SUPPORTED' },
      ]);
    }

    // 4. Kiểm tra xem loại tiền tệ này có cho phép chỉnh sửa địa chỉ ví (tức là thay đổi địa chỉ ví đích) không
    await this.checkWalletEditable(accountId, currency.id, receiverInfo);

    const receiver = await this.getReceiverInfo(method, receiverInfo);
    if (!receiver) {
      throw new BadRequestException([
        {
          field: 'receiverInfo',
          message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID,
        },
      ]);
    }

    await this.checkPendingTransactions(accountId, currency.id);
    //     await this.validateLimitAmountExchange(accountId, currency.id, amount);

    const token = UtilsService.getInstance().hashValue(
      `${accountId}${currencyCode}${method}`,
    );
    const cacheData: ExchangeCaching = {
      method,
      verifyPasscode: false,
      receiverInfo,
      amount,
      currency,
    };
    await CachingService.getInstance().set(
      token,
      cacheData,
      TOKEN_EXPIRES_SECONDS,
    );

    return {
      amount: { value: amount, currency: currencyCode },
      fee: { value: 0, currency: currencyCode },
      receiver,
      token,
    };
  }

  // Lấy số lượng giao dịch trong ngày và trong tháng của tài khoản
  private async validateLimitAmountExchange(
    accountId: string,
    currencyId: string,
    amount: number,
  ) {
    const now = new Date(new Date().setUTCHours(0, 0, 0, 0) - GMT_7);

    const firstOfMonth = new Date(now);
    firstOfMonth.setDate(1);

    const values = [
      now, // created_at >= ? (for daily amount)
      accountId, // sender_id = ?
      firstOfMonth, // created_at >= ? (for monthly amount)
      accountId, // sender_id = ?
      accountId, // a.id = ?
      currencyId, // cm.id = ?
    ];

    console.log({ values });

    // Lấy số lượng giao dịch trong ngày và trong tháng của tài khoản.
    const inquiry = await this._repo.sql<unknown[]>(
      CB_EXCHANGE_INQUIRY_SQL,
      ...values,
    );

    console.log({ inquiry });
    if (!inquiry || !inquiry.length) {
      throw new BadRequestException([
        {
          field: 'currencyId',
          message: VALIDATE_MESSAGE.CASHBACK.COIN_INVALID,
        },
      ]);
    }

    // So sánh số tiền yêu cầu với các giới hạn (limitInDay, limitInMonth) và kiểm tra số dư sau khi trừ khoản minHold.
    const { amountInDay, amountInMonth, cbAvailable, code } =
      inquiry[0] as InquiryDto;
    const {
      maxPerDay: limitInDay,
      maxPerMonth: limitInMonth,
      minHold,
    } = await this.getWithdrawLimitSettingByCurrency(code);

    if (amount + amountInDay > limitInDay) {
      throw new BadRequestException([
        {
          field: 'amount',
          message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID_MAX_DAY,
        },
      ]);
    }

    if (amount + amountInMonth > limitInMonth) {
      throw new BadRequestException([
        {
          field: 'amount',
          message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID_MAX_MONTH,
        },
      ]);
    }

    if (cbAvailable - minHold < amount)
      throw new BadRequestException([
        { field: 'amount', message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID },
      ]);
  }

  // Kiểm tra xem tài khoản có các giao dịch pending trước đó hay không
  private async checkPendingTransactions(
    accountId: string,
    currencyId: string,
  ) {
    const txPending = await this._repo.getCbTrans().count({
      where: {
        senderId: accountId,
        currencyId,
        type: CASHBACK_TYPE.EXCHANGE,
        status: CASHBACK_STATUS.PROCESSING,
      },
    });

    console.log({ txPending });
    if (txPending) {
      throw new BadRequestException([
        {
          field: 'currencyId',
          message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING,
        },
      ]);
    }
  }

  //  Kiểm tra nếu tài khoản được phép chỉnh sửa địa chỉ ví.
  private async checkWalletEditable(
    accountId: string,
    currencyId: string,
    receiverInfo: string,
  ) {
    if (receiverInfo) {
      const accountCurrency = await this._repo
        .getAccountExchangeCurrency()
        .findFirst({
          where: { accountId, currencyId },
          select: {
            walletAddress: true, // Lấy địa chỉ ví đã đăng ký của tài khoản
            currency: { select: { exchangeWalletEditable: true } }, // Kiểm tra xem loại tiền tệ này có cho phép chỉnh sửa địa chỉ ví (tức là thay đổi địa chỉ ví đích) không
          },
        });

      // Nếu tiền tệ không cho phép chỉnh sửa địa chỉ ví và địa chỉ ví hiện tại không khớp với receiverInfo, ném lỗi BadRequestException.
      if (
        accountCurrency &&
        !accountCurrency.currency.exchangeWalletEditable &&
        accountCurrency.walletAddress !== receiverInfo
      ) {
        throw new BadRequestException([
          {
            field: 'receiverInfo',
            message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID,
          },
        ]);
      }
    }
  }

  // Lấy thông tin người nhận dựa trên method trao đổi.
  private async getReceiverInfo(method: EXCHANGE_METHOD, receiverInfo: string) {
    switch (method) {
      // Với method là ONUS, sử dụng VNDCService để lấy thông tin tài khoản
      case EXCHANGE_METHOD.ONUS:
        return this._vndc.getAccountVNDC(receiverInfo);
      default:
        throw new BadRequestException([
          { field: 'method', message: 'METHOD_NOT_SUPPORTED' },
        ]);
    }
  }

  // Lấy cấu hình giới hạn giao dịch cho loại tiền tệ (currencyCode) yêu cầu.
  private async getWithdrawLimitSettingByCurrency(currencyCode: string) {
    return this._repo.getCurrencyLimitSetting().findFirst({
      where: {
        type: CurrencyLimitSettingType.WITHDRAW,
        currency: { code: currencyCode },
      },
      select: {
        fee: true,
        min: true,
        max: true,
        maxPerDay: true,
        maxPerMonth: true,
        minHold: true,
      },
    });
  }

  // Xác minh mã xác thực (passcode) của người dùng.
  async verifyPasscode(accountId: string, body: ExchangeV3VerifyPasscodeDto) {
    const { token: inquiryToken, passcode } = body;

    // Kiểm tra inquiryToken có tồn tại trong bộ nhớ cache.
    const cacheData =
      await CachingService.getInstance().get<ExchangeCaching>(inquiryToken);
    if (!cacheData) {
      throw new BadRequestException([
        { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
      ]);
    }

    const account = await this._repo
      .getAccount()
      .findUnique({ where: { id: accountId }, select: { passcode: true } });
    if (!UtilsService.getInstance().compareHash(passcode, account.passcode)) {
      throw new BadRequestException([
        {
          field: 'passcode',
          message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID,
        },
      ]);
    }

    const token = UtilsService.getInstance().hashValue(
      `${accountId}${cacheData.currency}${cacheData.method}`,
    );
    cacheData.verifyPasscode = true;

    // Xác minh passcode người dùng và lưu lại trạng thái verifyPasscode trong cache.
    return Promise.all([
      CachingService.getInstance().delete(inquiryToken),
      CachingService.getInstance().set(token, cacheData, TOKEN_EXPIRES_SECONDS),
    ]).then(() => ({ token }));
  }

  // Thực hiện giao dịch trao đổi cashback sau khi đã xác minh thông tin
  // Gửi hoặc nhận VNDC
  async submit(accountId: string, input: ExchangeV3SubmitDto) {
    this._logger.info(`submit: ${new Date().toISOString()}`, {
      accountId,
      input,
    });

    const { amount, currency, receiverInfo, method, token } = input;
    // Kiểm tra token trong cache để xác thực thông tin.
    const cache =
      await CachingService.getInstance().get<ExchangeCaching>(token);
    console.log({ cache });

    // Gọi getReceiverInfo để kiểm tra thông tin người nhận với phương thức method (ví dụ: ONUS). Nếu không hợp lệ, trả về lỗi.
    const receiver = await this.getReceiverInfo(method, receiverInfo);
    if (!receiver) {
      throw new BadRequestException([
        {
          field: 'receiverInfo',
          message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID,
        },
      ]);
    }
    if (
      !cache ||
      !cache.verifyPasscode ||
      cache.amount !== amount ||
      cache.currency.code !== currency ||
      cache.receiverInfo !== receiverInfo
    ) {
      throw new BadRequestException([
        { field: 'token', message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID },
      ]);
    }

    // Thực hiện giao dịch ONUS nếu loại tiền tệ là VNDC hoặc BBC, sau đó gọi hàm callVNDCOffChain để thực hiện giao dịch.
    if (method === EXCHANGE_METHOD.ONUS) {
      if (currency === CURRENCY_CODE.VNDC || currency === CURRENCY_CODE.BBC) {
        // phương thức callVNDCOffChain chịu trách nhiệm xử lý giao dịch thực tế,
        // bao gồm cả việc cập nhật trạng thái giao dịch (thành công hoặc thất bại).

        const output = await this.callVNDCOffChain({
          accountId,
          currency: cache.currency,
          amount,
          receiverInfo,
        });
        CachingService.getInstance().delete(token);
        return { ...output, receiver, currencyTo: cache.currency };
      }
    }

    // Nếu không hỗ trợ method này, ném lỗi METHOD_NOT_SUPPORTED.
    throw new BadRequestException([
      { field: 'method', message: 'METHOD_NOT_SUPPORTED' },
    ]);
  }

  // Thực hiện giao dịch cashback qua ONUS (off-chain) và cập nhật trạng thái giao dịch.
  // Phương thức HOLD_BALANCE và REVERT_BALANCE đảm bảo rằng tài khoản người dùng sẽ không bị ảnh hưởng nếu giao dịch thất bại.

  async callVNDCOffChain(input: VNDCOffChainOptions) {
    this._logger.info(`callVNDCOffChain started: ${new Date().toUTCString()}`);
    const { accountId, amount, currency, receiverInfo } = input;
    const { id: currencyId, code } = currency;

    // TODO get fee from CMS
    const fee = 0;
    let cbTx: Prisma.CashbackTransactionUncheckedCreateInput = {
      actionType: CASHBACK_ACTION_TYPE.SUBTRACT,
      currencyId,
    };

    // Gọi validateAmountAvailable để kiểm tra rằng người dùng có đủ số dư cho giao dịch
    const accountBalance = await this.validateAmountAvailable(
      accountId,
      currencyId,
      code,
      amount,
      fee,
    );

    const amountText = Intl.NumberFormat().format(amount) + ` ${code}`;
    const body: VNDCSendOffChainBody = {
      account_receive: receiverInfo,
      amount_send: amount.toString(),
      coin: currency.code,
    };

    const bulkOps: any = [];
    const txId = UtilsService.getInstance().getDbDefaultValue().id;

    // Khởi tạo giao dịch trong trạng thái PROCESSING với các chi tiết như amount, fee, currencyId, và receiverInfo.
    // cbTx lưu trữ chi tiết giao dịch như amount, currencyId, và trạng thái PROCESSING
    cbTx = {
      id: txId,
      currencyId,
      title: COMMON_TITLE[CASHBACK_TYPE.EXCHANGE],
      description: COMMON_DESCRIPTION.CASHBACK.PENDING,
      senderId: accountId,
      type: CASHBACK_TYPE.EXCHANGE,
      actionType: CASHBACK_ACTION_TYPE.SUBTRACT,
      amount,
      fee,
      status: CASHBACK_STATUS.PROCESSING,
      oldBalance: accountBalance.amount,
      cbHistories: {
        cbHistories: [
          {
            body,
            note: COMMON_TITLE[CASHBACK_TYPE.EXCHANGE],
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    };

    // Create pending transaction
    this._logger.db(`createPendingTx account pending -> ${accountId}:`, {
      ...cbTx,
      fromAccount: accountId,
    });

    // Gửi yêu cầu giữ số dư tạm thời (HOLD_BALANCE) để ngăn chặn giao dịch song song

    // là giao dịch tạm thời giữ số dư người dùng cho đến khi có kết quả từ ONUS hoặc VNDC.
    // Phương thức HOLD_BALANCE gửi yêu cầu giữ số dư trong tài khoản để ngăn các giao dịch song song.
    const txPending = await lastValueFrom(
      this._clientWallet.send<CashbackTransaction, WalletPayload>(
        MESSAGE_PATTERN.WALLET.HOLD_BALANCE,
        {
          accountId,
          cbAvailable: { amount, currencyId, version: accountBalance.version },
          cbTransaction: cbTx,
        },
      ),
    );

    // Sau khi khởi tạo giao dịch tạm thời, phương thức sẽ gửi yêu cầu tới ONUS hoặc VNDC để thực hiện chuyển tiền qua sendOffChain.
    setTimeout(async () => {
      this._logger.info(`sendOffChain started: ${new Date().toUTCString()}`);
      try {
        // Send request to ONUS
        this._logger.info(`sendOffChain request:`, {
          senderId: accountId,
          ...body,
        });

        const vndcJson = await this._vndc.sendOffChain(body);
        this._logger.info(`sendOffChain response:`, vndcJson);

        const txUpdateArgs: Prisma.CashbackTransactionUpdateArgs = {
          where: { id: txId },
          data: {},
        };
        // handle transaction status

        // Nếu thành công (VNDC_RESPONSE_OFF_CHAIN_CODE.SUCCESS), phương thức cập nhật giao dịch thành SUCCESS và lưu chi tiết và gửi thông báo
        // Lưu chi tiết vndcJson trong phản hồi giúp lưu trữ thông tin giao dịch để đối chiếu khi cần.
        if (vndcJson && vndcJson.code) {
          if (vndcJson.code === VNDC_RESPONSE_OFF_CHAIN_CODE.SUCCESS) {
            txPending.cbHistories['cbHistories'].push({
              note: 'Transaction successful',
              updatedAt: new Date().toISOString(),
            });
            cbTx.status = txPending.status = CASHBACK_STATUS.SUCCESS;
            txPending.description = COMMON_DESCRIPTION.CASHBACK.SUCCESS;
            txPending.vndcJson = vndcJson;
            txPending.oldBalance = new Prisma.Decimal(txPending.oldBalance);
            txUpdateArgs.data = txPending;

            this._logger.db(`sendOffChain account success -> ${accountId}:`, {
              ...txUpdateArgs,
              fromAccount: accountId,
            });
            bulkOps.push(this._repo.getCbTrans().update(txUpdateArgs));

            // sendNotification success
            const description = NOTIFY_DESCRIPTION.REWARD_CHAIN.replace(
              '$value',
              amountText,
            );
            bulkOps.push(
              this._repo.getAccountExchangeCurrency().upsert({
                where: { accountId_currencyId: { accountId, currencyId } },
                create: {
                  accountId,
                  currencyId,
                  walletAddress: receiverInfo,
                },
                update: { walletAddress: receiverInfo },
              }),
              //               this._repo.getNotification().create({
              //                 data: this.pushNotification(
              //                   accountBalance,
              //                   cbTx.id,
              //                   description,
              //                   CASHBACK_STATUS.SUCCESS,
              //                 ),
              //               }),
            );
          } else {
            // Nếu thất bại, trạng thái giao dịch được cập nhật thành FAILURE, giao dịch được hủy, và yêu cầu hoàn lại số dư (REVERT_BALANCE).
            const { version } = await this._repo.getCbAvailable().findUnique({
              where: {
                accountId_currencyId_version: {
                  accountId,
                  currencyId,
                  version: 1,
                },
              },
              select: { version: true },
            });

            cbTx.status = txPending.status = CASHBACK_STATUS.FAILURE;
            txPending.cbHistories['cbHistories'].push({
              note: 'Transaction fail',
              updatedAt: new Date().toISOString(),
            });
            txPending.description =
              COMMON_DESCRIPTION.CASHBACK.SEND_VNDC_FAILED +
              ' ' +
              vndcJson.message;
            txPending.vndcJson = vndcJson;

            this._logger.db(`sendOffChain account fail -> ${accountId}:`, {
              ...txPending,
              fromAccount: accountId,
            });

            await firstValueFrom(
              this._clientWallet.send<unknown, unknown>(
                MESSAGE_PATTERN.WALLET.REVERT_BALANCE,
                {
                  cbTransaction: txPending,
                  version,
                },
              ),
            );

            // sendNotification failure
            const description = NOTIFY_DESCRIPTION.REWARD_CHAIN.replace(
              '$value',
              amountText,
            );
            //             bulkOps.push(
            //               this._repo.getNotification().create({
            //                 data: this.pushNotification(
            //                   accountBalance,
            //                   cbTx.id,
            //                   description,
            //                   CASHBACK_STATUS.FAILURE,
            //                 ),
            //               }),
            //             );
          }
          await this._repo.transaction(bulkOps);
        } else {
          txPending.vndcJson = vndcJson;
          txUpdateArgs.data = txPending;
          await this._repo.getCbTrans().update(txUpdateArgs);
        }
        this._logger.info(`sendOffChain finished: ${new Date().toUTCString()}`);
      } catch (error) {
        this._logger.info(
          `sendOffChain finished: ${new Date().toUTCString()} with error: ${
            error.stack
          }`,
        );
      }
    }, 1000);

    this._logger.info(`callVNDCOffChain finished: ${new Date().toUTCString()}`);
    cbTx.cbHistories = undefined;
    return cbTx;
  }

  // Kiểm tra xem số dư tài khoản có đủ cho giao dịch không, bao gồm cả phí và giữ lại một khoản minHold.
  async validateAmountAvailable(
    accountId: string,
    currencyId: string,
    code: string,
    amount: number,
    fee: number,
  ) {
    this._logger.info(
      `validateAmountAvailable started: ${new Date().toUTCString()}`,
    );

    // Kiểm tra số dư tài khoản dựa trên truy vấn SQL (find-account-balance.sql), nếu không đủ điều kiện, ném lỗi AMOUNT_INVALID.
    const sql = readFileSync(
      join(process.cwd(), 'sql/find-account-balance.sql'),
    ).toString();

    console.log({ sql });

    const result = await this._repo.sql<CBAvailable[]>(
      sql,
      accountId,
      currencyId,
    );

    console.log({ result });

    if (!result || !result.length) {
      this._logger.info(
        `validateAmountAvailable finished with error ACCOUNT_INVALID: ${new Date().toUTCString()}`,
      );
      throw new BadRequestException([
        { field: 'account', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }

    this._logger.info('validateAmountAvailable', result[0]);

    const re = {
      data: {
        id: '3402dfb2-c83e-4d4a-8a51-8104af775b38',
        deviceToken: null,
        version: 1,
        amount: '0',
        incoming: '0',
        outgoing: '0',
        balance: '0',
      },
    };

    // Nếu tài khoản hợp lệ và có số dư, lấy số dư của tài khoản từ kết quả truy vấn và lưu trong biến accountBalance.
    const accountBalance = result[0];

    // để lấy cài đặt giới hạn rút tiền cho loại tiền tệ hiện tại,
    // bao gồm cả minHold - số dư tối thiểu yêu cầu giữ lại.
    const setting = await this.getWithdrawLimitSettingByCurrency(code);
    const minHold = setting?.minHold || 0;

    // Kiểm tra xem số dư trong tài khoản (accountBalance.amount)
    // có nhỏ hơn số tiền yêu cầu hoặc có đáp ứng được số tiền cần chuyển cộng
    // với phí(amount + fee) hay không
    if (
      accountBalance.amount < accountBalance.balance ||
      accountBalance.amount - minHold < amount + fee
    ) {
      this._logger.info(
        `validateAmountAvailable finished with error AMOUNT_INVALID: ${new Date().toUTCString()}`,
      );
      throw new BadRequestException([
        { field: 'amount', message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID },
      ]);
    }

    this._logger.info(
      `validateAmountAvailable finished: ${new Date().toUTCString()}`,
    );
    return accountBalance;
  }
}
