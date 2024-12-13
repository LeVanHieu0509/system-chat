import { CachingService } from '@app/caching';
import {
  CASHBACK_STATUS,
  CURRENCY_CODE,
  LATEST_VERSION,
  MobileVersion,
  OTP_TYPE,
  PARTNER_TRANS_TYPE,
  QUEUES,
  STATUS,
} from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { Auth, BuyVNDCInquiryRequestDto, InquiryQueryDto } from '@app/dto';
import { VersionQueryDto } from '@app/dto/common';
import { COMMON_NOTE_STATUS, COMMON_TITLE } from '@app/notification';
import { MainRepo } from '@app/repositories/main.repo';
import { UtilsService } from '@app/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { VNDCService } from 'libs/plugins';

type CashbackCaching = {
  confirm: boolean;
  verifyPin: boolean;
  amount: number;
  userId: string;
  receiverId: string;
  currencyId: string;
};

@Injectable()
export class CashbackService {
  private readonly _logger: Logger = new Logger(CashbackService.name);

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    private readonly _repo: MainRepo,
    private readonly _vndc: VNDCService,
  ) {}

  async getCoinList(input: VersionQueryDto) {
    this._logger.log(
      `CashbackService --> getCoinList input: ${JSON.stringify(input)}`,
    );
    const { version } = input;
    const where: Prisma.CurrencyMasterWhereInput = {
      status: STATUS.ACTIVE,
      code: { in: [CURRENCY_CODE.SATOSHI, CURRENCY_CODE.VNDC] },
    };

    if (
      UtilsService.getInstance().compareVersion(
        version,
        MobileVersion['1.3.5'],
      ) > -1
    ) {
      where.code = undefined;
      where.visible = true;
    }
    return this._repo
      .getCurrency()
      .findMany({ where, select: { code: true, name: true } });
  }

  async getCashback(input: VersionQueryDto & Auth) {
    this._logger.log(`getCashback input: ${JSON.stringify(input)}`);

    const { userId: accountId, version } = input;

    // Điều kiện để lấy các bản ghi hoàn tiền có sẵn (CashbackAvailable),
    // với accountId của người dùng, và loại tiền là Satoshi(code: CURRENCY_CODE.SATOSHI)
    // có trạng thái ACTIVE.
    const whereAvailable: Prisma.CashbackAvailableWhereInput = {
      accountId,
      currency: { status: STATUS.ACTIVE, code: CURRENCY_CODE.SATOSHI },
    };

    // Điều kiện để lấy các bản ghi giao dịch hoàn tiền (CashbackTransaction),
    // với receiverId là accountId, trạng thái là PROCESSING hoặc APPROVED,
    // và loại tiền là Satoshi(code: CURRENCY_CODE.SATOSHI) có trạng thái ACTIVE.

    const whereTx: Prisma.CashbackTransactionWhereInput = {
      receiverId: accountId,
      status: { in: [CASHBACK_STATUS.PROCESSING, CASHBACK_STATUS.APPROVED] },
      currency: { status: STATUS.ACTIVE, code: CURRENCY_CODE.SATOSHI },
    };

    console.log({ version });
    // mở rộng để bao gồm cả Satoshi và VNDC
    if (version === LATEST_VERSION) {
      whereAvailable.currency = {
        status: STATUS.ACTIVE,
        code: { in: [CURRENCY_CODE.SATOSHI, CURRENCY_CODE.VNDC] },
      };
      whereTx.currency = {
        status: STATUS.ACTIVE,
        code: { in: [CURRENCY_CODE.SATOSHI, CURRENCY_CODE.VNDC] },
      };
    }
    let output: {
      amount: number | string | Decimal;
      currency: string;
      pending: unknown;
    }[] = [];
    const [cbAvailable, cbPending] = await Promise.all([
      this._repo.getCbAvailable().findMany({
        where: whereAvailable,
        select: {
          amount: true,
          currency: { select: { id: true, code: true } },
        },
      }),
      this._repo.getCbTrans().findMany({
        where: whereTx,
        select: { amount: true, currencyId: true },
      }),
    ]);

    // TODO remove convert to number in future
    output = cbAvailable.map((c) => {
      const pending = [];
      cbPending.forEach((p) => {
        if (p.currencyId === c.currency.id) {
          pending.push({
            amount: version === LATEST_VERSION ? p.amount : ~~p.amount,
          });
        }
      });
      return {
        amount: version === LATEST_VERSION ? c.amount : ~~c.amount,
        currencyId: c.currency.id,
        currency: c.currency.code,
        pending,
      };
    });

    return output;
  }

  /*
    1. Phương thức buyVNDC thực hiện một quy trình khá chi tiết để xử lý giao dịch mua VNDC
    2. nghĩa là VNDC sẽ được gửi từ hệ thống đến tài khoản nhận VNDC mà người dùng cung cấp
    3. Trước khi tạo giao dịch, nó lấy tỷ giá (exchange rate) giữa Satoshi và VNDC và sử dụng tỷ giá này để thực hiện giao dịch.
    4. Mục tiêu là xử lý giao dịch VNDC từ hệ thống đến người dùng (outgoing)

    ==> Tập trung vào giao dịch gửi VNDC từ hệ thống đến người dùng (outgoing transaction), 
    lấy tỷ giá từ dịch vụ VNDC và sử dụng tỷ giá đó.
    => gửi VNDC từ hệ thống tới người nhận
    => USER thanh toán cho ONUS => ONUS gửi VNDC về ví BITBACK => BITBACK thực hiện cộng VNDC cho user
  */

  async buyVNDC(
    input: BuyVNDCInquiryRequestDto & { accountId: string; orderId: string },
  ) {
    const { accountId, amount, orderId, vndcReceiver } = input;

    //1. Gọi phương thức getExchangeRate từ dịch vụ VNDC
    // để lấy tỷ giá hiện tại cho cặp tiền tệ Satoshi và VNDC.
    const exchangeRate = await this._vndc.getExchangeRate();
    const { ask, bid } =
      exchangeRate[`${CURRENCY_CODE.SATOSHI}${CURRENCY_CODE.VNDC}`];

    await this._repo.getPartnerTransaction().create({
      data: {
        accountId, //  ID của tài khoản người dùng thực hiện giao dịch.
        vndcReceiver, // Địa chỉ hoặc tài khoản mà VNDC sẽ được gửi đến.
        amount, // Số lượng VNDC mà người dùng muốn mua.
        orderId, //  ID của đơn hàng.
        exchangeRate: Number(ask > bid ? ask : bid), // Tỷ giá được sử dụng cho giao dịch, chọn giữa ask và bid (sử dụng ask nếu nó lớn hơn bid, ngược lại thì sử dụng bid).
        transactionId: orderId.replace(/[-]/gm, ''),
        type: PARTNER_TRANS_TYPE.OUTGOING, // Loại giao dịch là OUTGOING, biểu thị rằng đây là một giao dịch gửi VNDC từ hệ thống đến người dùng.
        title: COMMON_TITLE.PARTNER_VNDC_PAYMENT,
        description: COMMON_NOTE_STATUS[CASHBACK_STATUS.PROCESSING],
        histories: { histories: [{ amount, orderId, vndcReceiver }] },
      },
    });

    //2. Send noti tới cho storedId để approved
    //3. Store sẽ update status transaction đó -> khi mà update thì storeId sẽ bị trừ tiền đi và user sẽ được cộng tiền
  }

  // Kiểm tra thông tin giao dịch cashback cho một người dùng (bao gồm số tiền và tài khoản nhận).
  // --> Trả về chi tiết về giao dịch (tiền, người nhận, phí, v.v.).
  async getInquiry(input: InquiryQueryDto, userId: string) {
    this._logger.log(
      `getInquiry accountId: ${userId} input: ${JSON.stringify(input)}`,
    );

    const { amount, currencyId, email, phone } = input;
    const key = phone ? UtilsService.getInstance().toIntlPhone(phone) : email;

    // check account VNDC valid
    const accountVNDC = await this._vndc.getAccountVNDC(phone || email);
    if (!accountVNDC || !accountVNDC.kyc) {
      const field = phone ? 'phone' : 'email';
      throw new BadRequestException([
        { field, message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }

    const balance = await this.getLatestAmount(userId, currencyId);
    if (balance - UtilsService.getInstance().getAccountMinHold() < amount)
      throw new BadRequestException([
        { field: 'amount', message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID },
      ]);

    const [account, currency] = await Promise.all([
      this._repo.getAccount().findFirst({
        where: {
          AND: [
            { OR: [{ phone: key }, { email: key }] },
            { status: STATUS.ACTIVE },
          ],
        },
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          email: true,
        },
      }),
      this._repo.getCurrency().findFirst({
        where: { id: currencyId, status: STATUS.ACTIVE },
        select: { name: true, code: true },
      }),
    ]);

    const token = UtilsService.getInstance().hashValue(
      `${amount}${currencyId}${userId}${account.id}`,
    );
    const cacheData: CashbackCaching = {
      verifyPin: false,
      amount,
      userId,
      receiverId: account.id,
      currencyId,
      confirm: false,
    };
    CachingService.getInstance().set(
      token,
      cacheData,
      // this._otp.getExpires(OTP_TYPE.CASHBACK),
      60,
    );
    // TODO get delivery fee (from 3rd API)
    return {
      amount: { value: amount, currency: currency.code },
      fee: { value: 0, currency: currency.code },
      receiver: account,
      currency,
      token,
    };
  }

  private async getLatestAmount(accountId: string, currencyId: string) {
    this._logger.log(
      `getLatestAmount accountId: ${accountId} currencyId: ${currencyId}`,
    );

    const cbAvailable = await this._repo.getCbAvailable().findFirst({
      where: { accountId, currencyId },
      select: { amount: true },
    });
    // TODO remove convert to number in future
    return cbAvailable ? ~~cbAvailable.amount : 0;
  }
}
