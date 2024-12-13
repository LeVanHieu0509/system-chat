import {
  CASHBACK_ACTION_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CURRENCY_CODE,
  LATEST_VERSION,
  NOTIFICATION_TYPE,
  PARTNER_TRANS_TYPE,
  PAY_ME_STATE,
} from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  Auth,
  BuySatoshiRequestDto,
  BuyVNDCRequestDto,
  VersionQueryDto,
} from '@app/dto';
import {
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
  replaceMarkup,
} from '@app/notification/notification.description';
import { MainRepo } from '@app/repositories/main.repo';
import { UtilsService } from '@app/utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { PAY_ME_STORE_ID } from 'libs/config';
import { VNDCService } from 'libs/plugins';

@Injectable()
export class PartnerService {
  private readonly _logger: Logger = new Logger(PartnerService.name);

  constructor(
    private readonly _repo: MainRepo,
    private readonly _vndc: VNDCService,
  ) {}

  /*
    1. Function này liên quan đến việc tạo giao dịch VNDC cho người dùng (incoming transaction),
    tức là ghi nhận một giao dịch VNDC đang chờ xử lý trong hệ thống.

    2. Trước khi tạo giao dịch, nó kiểm tra số lượng giao dịch đang chờ xử lý (pendingTransactionCount), 
    nếu có giao dịch nào đang xử lý thì không cho phép tạo giao dịch mới.
    3. Tạo một bản ghi giao dịch trong cơ sở dữ liệu với trạng thái là PROCESSING
    4. ID người dùng, số lượng VNDC, phương thức thanh toán, và thông tin cửa hàng.

    ==> Tạo giao dịch cho việc mua VNDC, ghi nhận giao dịch với trạng thái PROCESSING, 
    kiểm tra các giao dịch đang chờ xử lý và không tính đến tỷ giá cụ thể, 
    chỉ sử dụng tỷ lệ cố định (1:1).
  */

  async createBuyVNDCTransaction(
    input: BuyVNDCRequestDto & { accountId: string },
  ) {
    this._logger.log(
      `createBuyVNDCTransaction input: ${JSON.stringify(input)}`,
    );

    const { accountId, amount, methodType, storeId } = input;
    const [pendingTransactionCount, currency] = await Promise.all([
      this._repo
        .getPartnerTransaction()
        .count({ where: { status: CASHBACK_STATUS.PROCESSING, accountId } }),
      this._repo.getCurrency().findFirst({
        where: { code: CURRENCY_CODE.VNDC },
        select: { id: true },
      }),
    ]);

    if (pendingTransactionCount > 0)
      throw new BadRequestException([
        {
          field: 'account',
          message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING,
        },
      ]);

    const orderId = UtilsService.getInstance()
      .getDbDefaultValue()
      .id.replace(/[-]/gm, '');
    // const storeId = PAY_ME_STORE_ID;
    input.storeId = storeId;

    const description = replaceMarkup(NOTIFY_DESCRIPTION.DEPOSIT.PENDING, {
      amount: `${Intl.NumberFormat().format(amount)} ` + CURRENCY_CODE.VNDC,
      paidAmount: Intl.NumberFormat().format(amount),
    });

    await this._repo.getPartnerTransaction().create({
      data: {
        accountId,
        amountExchange: amount,
        amount,
        orderId,
        exchangeRate: 1,
        transactionId: orderId,
        status: CASHBACK_STATUS.PROCESSING,
        type: PARTNER_TRANS_TYPE.INCOMING,
        title: COMMON_TITLE.PARTNER_VNDC_PAYMENT,
        description,
        storeId,
        methodType,
        currencyId: currency.id,
        histories: { histories: [{ amount, orderId }] },
      },
    });

    // Trả về trước khi mà update database xong, hầu hết mọi logic đều tách biệt với database
    return { ...input, orderId };
  }

  // user cancel with orderID
  async cancelTransactionById(orderId: string) {
    this._logger.log(`cancelTransactionById orderId: ${orderId}`);

    const txPending = await this._repo.getPartnerTransaction().findFirst({
      where: { orderId, status: CASHBACK_STATUS.PROCESSING },
      select: { orderId: true, histories: true },
    });

    if (txPending) {
      const { histories } = txPending;
      histories['histories'].push({
        status: CASHBACK_STATUS.REJECTED,
        reason: 'Người dùng hủy giao dịch',
        updatedAt: new Date().toISOString(),
      });
      return this._repo.getPartnerTransaction().update({
        where: { orderId },
        data: { status: CASHBACK_STATUS.REJECTED, histories },
      });
    }
    return { status: false };
  }

  async updateStatusTransaction(accountId: string, orderId: string) {
    this._logger.log(`updateStatusTransaction orderId: ${orderId}`);
    // return { status: true };
    const tran = await this._repo.getPartnerTransaction().findFirst({
      where: {
        transactionId: orderId,
        accountId,
        status: { not: CASHBACK_STATUS.REJECTED },
      },
      select: {
        status: true,
        histories: true,
        amount: true,
        transactionId: true,
        exchangeRate: true,
        amountExchange: true,
        account: { select: { deviceToken: true } },
      },
    });

    this._logger.log(`tran ${JSON.stringify(tran)}`);

    if (!tran)
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.CASHBACK.TRANSACTION_INVALID },
      ]);

    if (tran.status === CASHBACK_STATUS.SUCCESS) return { status: false };
    try {
      // const { data } = (await this._payMe.post(PAY_ME_BE_QUERY_PATH, {
      //     partnerTransaction: tran.transactionId
      // })) as { data: PayMeData };
      const idTran = UtilsService.getInstance().generateRandomInteger(
        10,
        1000000000,
      );

      // data payme trả về
      const data = {
        state: 'SUCCEEDED',
        amount: Number(tran.amount) * tran.exchangeRate,
        transaction: String(idTran),
      };

      console.log({ data });
      if (!data || PAY_ME_STATE[data.state] === tran.status) {
        return { status: false };
      }

      const status = PAY_ME_STATE[data.state];

      this._logger.log(`payMeData: ${JSON.stringify(data)}`);

      const bulkOps: PrismaPromise<any>[] = [];
      const { histories: transHistories } = tran;

      const { histories = [] } =
        (transHistories as { histories: Record<string, unknown>[] }) || {};

      const amount = Math.round(data.amount / tran.exchangeRate);
      histories.push({ status, amount, paymeId: data.transaction });

      //  insert and send notification
      const description = NOTIFY_DESCRIPTION.WALLET_PAYMENT[data.state]
        .replace(
          '$valueSAT',
          `${Intl.NumberFormat().format(amount)} ` + CURRENCY_CODE.SATOSHI,
        )
        .replace('$valueVNDC', Intl.NumberFormat().format(data.amount));

      const transactionId = UtilsService.getInstance().getDbDefaultValue().id;

      bulkOps.push(
        this._repo.getPartnerTransaction().update({
          where: { transactionId: orderId },
          data: {
            description,
            amount,
            paymeId: data.transaction,
            status,
            histories: tran.histories,
          },
        }),
        this._repo.getNotification().create({
          data: {
            description,
            accountId,
            ref: status === CASHBACK_STATUS.SUCCESS ? transactionId : orderId,
            title: COMMON_TITLE.DEPOSIT,
            type: NOTIFICATION_TYPE.WALLET_PAYMENT,
          },
        }),
      );

      if (status === CASHBACK_STATUS.SUCCESS) {
        const currency = await this._repo.getCurrency().findFirst({
          where: { code: CURRENCY_CODE.SATOSHI },
          select: { id: true },
        });

        const cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput = {
          id: transactionId,
          amount,
          currencyId: currency.id,
          title: COMMON_TITLE.DEPOSIT,
          description,
          receiverId: accountId,
          type: CASHBACK_TYPE.PAYMENT,
          status,
          cbHistories: {
            cbHistories: [
              { note: description, updatedAt: new Date().toISOString() },
            ],
          },
          actionType: CASHBACK_ACTION_TYPE.ADD,
        };

        bulkOps.push(
          this._repo.getCbTrans().create({
            data: cbTransaction,
          }),

          this._repo.getCbAvailable().update({
            where: {
              accountId_currencyId_version: {
                currencyId: currency.id,
                accountId,
                version: 1,
              },
            },
            data: { amount: { increment: amount } },
          }),
        );
      }

      await this._repo.transaction(bulkOps);
      //     if (tran.account.deviceToken)
      //         NotificationService.getInstance().sendNotifyWalletPayment(
      //             [tran.account.deviceToken],
      //             description,
      //             COMMON_TITLE.PARTNER_SAT_PAYMENT
      //         );

      return { status: true };
    } catch (error) {
      this._repo.sendLogError(error);
      return { status: false };
    }
  }

  /*
    1. Function này giúp get ra tất cả transaction đang được giao dịch có trạng thái là PENDING
    2. User chỉ được giao dịch 1 lần, mua 1 đồng coin tại 1 thời điểm.
  */

  async getTransactionByAccountId(input: VersionQueryDto & Auth) {
    this._logger.log(
      `getTransactionByAccountId input: ${JSON.stringify(input)}`,
    );

    const { userId: accountId, version } = input;

    const output = await this._repo.getPartnerTransaction().findMany({
      where: { status: CASHBACK_STATUS.PROCESSING, accountId },
      select: {
        orderId: true,
        amount: true,
        amountExchange: true,
        status: true,
        title: true,
        type: true,
        methodType: true,
        partnerType: true,
        description: true,
        updatedAt: true,
        account: { select: { id: true, fullName: true } },
      },
    });

    if (version === LATEST_VERSION) return output;

    output.forEach((tx) => {
      tx.amount = ~~tx.amount as any;
      tx.amountExchange = ~~tx.amountExchange as any;
    });

    return output;
  }

  // dùng để kiểm tra và tạo giao dịch mua Satoshi cho một tài khoản

  async createTransactionForBuyingSatoshi(
    input: BuySatoshiRequestDto & { accountId: string },
  ) {
    this._logger.log(
      `createTransactionForBuyingSatoshi input: ${JSON.stringify(input)}`,
    );

    const { accountId, amount, methodType } = input;

    // Đếm số lượng giao dịch có trạng thái PROCESSING cho accountId.

    const [pending, currency] = await Promise.all([
      this._repo
        .getPartnerTransaction()
        .count({ where: { status: CASHBACK_STATUS.PROCESSING, accountId } }),
      this._repo.getCurrency().findUnique({
        where: { code: CURRENCY_CODE.SATOSHI },
        select: { id: true },
      }),
    ]);

    // Nếu có bất kỳ giao dịch nào đang xử lý(pending > 0), sẽ không cho phép tạo thêm giao dịch mới.
    // Điều này đảm bảo rằng mỗi tài khoản chỉ có thể có một giao dịch PROCESSING tại một thời điểm
    if (pending > 0)
      throw new BadRequestException([
        {
          field: 'account',
          message: VALIDATE_MESSAGE.CASHBACK.HAS_TRANSACTION_PENDING,
        },
      ]);

    // Lấy tỷ giá hối đoái từ dịch vụ VNDC.
    const exchangeRate = await this._vndc.getExchangeRate();

    if (
      exchangeRate &&
      exchangeRate[`${CURRENCY_CODE.SATOSHI}${CURRENCY_CODE.VNDC}`]
    ) {
      // Lấy giá ask và bid từ tỷ giá hối đoái của Satoshi/VNDC.
      const { ask, bid } =
        exchangeRate[`${CURRENCY_CODE.SATOSHI}${CURRENCY_CODE.VNDC}`];

      // Tạo một orderId duy nhất cho giao dịch này bằng cách lấy giá trị mặc định từ UtilsService và loại bỏ ký tự -.
      const orderId = UtilsService.getInstance()
        .getDbDefaultValue()
        .id.replace(/[-]/gm, '');

      // được chọn là ask nếu ask > bid, ngược lại chọn bid.
      const rateValue = Number(ask > bid ? ask : bid);
      const storeId = PAY_ME_STORE_ID;

      // amountExchange là giá trị tiền việt tương đương với số lượng Satoshi mà người dùng muốn mua, được làm tròn đến số nguyên gần nhất.
      const amountExchange = Math.round(rateValue * input.amount);
      input.amountExchange = amountExchange;

      input.storeId = storeId;
      const description = NOTIFY_DESCRIPTION.WALLET_PAYMENT.PENDING.replace(
        '$valueSAT',
        `${Intl.NumberFormat().format(amount)} ` + CURRENCY_CODE.SATOSHI,
      ).replace('$valueVNDC', Intl.NumberFormat().format(amountExchange));

      /*
        1. Tính toán giá trị VNDC dựa trên số lượng Satoshi người dùng muốn mua
      */
      await this._repo.getPartnerTransaction().create({
        data: {
          accountId,
          amountExchange, // amountExchange là số tiền quy đổi từ Satoshi sang VND
          amount, // Đây là số lượng Satoshi mà người dùng muốn mua.
          orderId,
          exchangeRate: rateValue, // Đây là tỷ giá hối đoái giữa Satoshi và VND, được lấy từ dịch vụ VND.
          transactionId: orderId,
          type: PARTNER_TRANS_TYPE.INCOMING,
          status: CASHBACK_STATUS.PROCESSING, //default là 1
          title: COMMON_TITLE.PARTNER_SAT_PAYMENT,
          description,
          storeId,
          methodType,
          currencyId: currency.id,
          histories: { histories: [{ amount, orderId, amountExchange }] },
        },
      });

      // có nghĩa là người dùng sẽ cần 100,000 VNDC để mua 1000 Satoshi theo tỷ giá hiện tại.

      return { ...input, orderId };
    } else {
      throw new BadRequestException([
        { field: 'amount', message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID },
      ]);
    }
  }
}
