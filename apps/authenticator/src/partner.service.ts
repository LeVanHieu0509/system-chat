import {
  CASHBACK_STATUS,
  CURRENCY_CODE,
  PARTNER_TRANS_TYPE,
} from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { BuyVNDCRequestDto } from '@app/dto';
import {
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
  replaceMarkup,
} from '@app/notification/notification.description';
import { MainRepo } from '@app/repositories/main.repo';
import { UtilsService } from '@app/utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PAY_ME_STORE_ID } from 'libs/config';

@Injectable()
export class PartnerService {
  private readonly _logger: Logger = new Logger(PartnerService.name);

  constructor(private readonly _repo: MainRepo) {}
  async createBuyVNDCTransaction(
    input: BuyVNDCRequestDto & { accountId: string },
  ) {
    this._logger.log(
      `createBuyVNDCTransaction input: ${JSON.stringify(input)}`,
    );

    const { accountId, amount, methodType } = input;
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
    const storeId = PAY_ME_STORE_ID;
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
    return { status: true };
    // const tran = await this._repo.getPartnerTransaction().findFirst({
    //     where: { transactionId: orderId, accountId, status: { not: CASHBACK_STATUS.REJECTED } },
    //     select: {
    //         status: true,
    //         histories: true,
    //         amount: true,
    //         transactionId: true,
    //         exchangeRate: true,
    //         account: { select: { deviceToken: true } }
    //     }
    // });
    // if (!tran) throw new BadRequestException([{ field: 'id', message: VALIDATE_MESSAGE.CASHBACK.TRANSACTION_INVALID }]);

    // if (tran.status === CASHBACK_STATUS.SUCCESS) return { status: false };
    // try {
    //     const { data } = (await this._payMe.post(PAY_ME_BE_QUERY_PATH, {
    //         partnerTransaction: tran.transactionId
    //     })) as { data: PayMeData };
    //     if (!data || PAY_ME_STATE[data.state] === tran.status) return { status: false };
    //     const status = PAY_ME_STATE[data.state];
    //     this._logger.log(`updateStatusTransaction payMeData: ${JSON.stringify(data)}`);

    //     const bulkOps: Operation[] = [];
    //     const { histories: transHistories } = tran;
    //     const { histories = [] } = (transHistories as { histories: Record<string, unknown>[] }) || {};
    //     const amount = Math.round(data.amount / tran.exchangeRate);

    //     histories.push({ status, amount, paymeId: data.transaction });

    //     //  insert and send notification
    //     const description = NOTIFY_DESCRIPTION.WALLET_PAYMENT[data.state]
    //         .replace('$valueSAT', `${Intl.NumberFormat().format(amount)} ` + SATOSHI_CODE)
    //         .replace('$valueVNDC', Intl.NumberFormat().format(data.amount));

    //     const transactionId = UtilsService.getInstance().getDbDefaultValue().id;

    //     bulkOps.push(
    //         this._repo.getPartnerTransaction().update({
    //             where: { transactionId: orderId },
    //             data: { description, amount, paymeId: data.transaction, status, histories: tran.histories }
    //         }),
    //         this._repo.getNotification().create({
    //             data: {
    //                 description,
    //                 accountId,
    //                 ref: status === CASHBACK_STATUS.SUCCESS ? transactionId : orderId,
    //                 title: COMMON_TITLE.DEPOSIT,
    //                 type: NOTIFICATION_TYPE.WALLET_PAYMENT
    //             }
    //         })
    //     );

    //     if (status === CASHBACK_STATUS.SUCCESS) {
    //         const currency = await this._repo
    //             .getCurrency()
    //             .findFirst({ where: { code: SATOSHI_CODE }, select: { id: true } });

    //         bulkOps.push(
    //             this._repo.getCbTrans().create({
    //                 data: {
    //                     id: transactionId,
    //                     amount,
    //                     currencyId: currency.id,
    //                     title: COMMON_TITLE.DEPOSIT,
    //                     description,
    //                     receiverId: accountId,
    //                     type: CASHBACK_TYPE.PAYMENT,
    //                     status,
    //                     cbHistories: { cbHistories: [{ note: description, updatedAt: new Date().toISOString() }] }
    //                 }
    //             }),
    //             this._repo.getCbAvailable().update({
    //                 where: { currencyId_accountId: { currencyId: currency.id, accountId } },
    //                 data: { amount: { increment: amount } }
    //             })
    //         );
    //     }

    //     await this._repo.transaction(bulkOps);
    //     if (tran.account.deviceToken)
    //         NotificationService.getInstance().sendNotifyWalletPayment(
    //             [tran.account.deviceToken],
    //             description,
    //             COMMON_TITLE.PARTNER_SAT_PAYMENT
    //         );

    //     return { status: true };
    // } catch (error) {
    //     this._repo.sendLogError(error);
    //     return { status: false };
    // }
  }
}
