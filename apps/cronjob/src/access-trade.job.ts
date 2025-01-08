import {
  ACCESS_TRADE_TRANS_STATUS,
  ACCOUNT_LUCKY_WHEEL_STATUS,
  CAMPAIGN_PARAMS,
  CASHBACK_ACTION_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CURRENCY_CODE,
  DAILY_LUCKY_WHEEL_TYPE,
  EXPIRATION_REWARD,
  MESSAGE_PATTERN,
  NOTIFICATION_TYPE,
  QUEUES,
  TIME_ZONE_VN,
} from '@app/common';
import {
  COMMON_DESCRIPTION,
  COMMON_NOTE_STATUS,
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
} from '@app/notification';
import { NotificationV2Service } from '@app/notification/notification-v2.service';
import { UtilsService } from '@app/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { Prisma, PrismaPromise } from '@prisma/client';
import {
  ACCESS_TRACE_KEY_V2,
  ACCESS_TRADE_TRANSACTION,
  IS_PRODUCTION,
} from 'libs/config';
import { MainRepo } from '@app/repositories/main.repo';
import { VNDCService } from 'libs/plugins';
import { firstValueFrom } from 'rxjs';

type TransactionAccessTrade = {
  id: string;
  status: number; // 0 - hold, 1 - approved, 2 - rejected
  merchant: string;
  utm_term: string;
  utm_content: string;
  utm_source: string;
  utm_campaign: string;
  utm_medium: string;
  transaction_id: string;
  transaction_value: number;
  transaction_time: string;
  update_time: string;
  confirmed_time: string;
  is_confirmed: number; //0 - pending , 1 - approved
  commission: number;
  product_price: number;
  product_id: string;
};
type TransactionRes = { total: number; data: TransactionAccessTrade[] };
type Transaction = {
  id: string;
  accountId: string;
  transactionValue: number;
  status: number;
};

type CashbackInsertOptions = {
  transaction: TransactionAccessTrade;
  configAmount: number;
  rateValue: number;
  currencyId: string;
  until: string;
};

type AccessTradeUrlOptions = {
  current: Date;
  status?: number;
  day?: number;
  since?: Date;
};

type CommissionPartnerProps = {
  totalValue: number;
  commission: number;
  transactionId: string;
  referralFrom: string;
};

const HEADER = { Authorization: `Token ${ACCESS_TRACE_KEY_V2}` };

// Định nghĩa số lượng giao dịch tối đa được xử lý mỗi lần, nhằm tránh quá tải hệ thống.
const MAX_ITEMS = 50;

/*
  Quy trình hoạt động:

  1. Nhà cung cấp dịch vụ/sản phẩm (Advertiser) đăng ký chiến dịch (Campaign) trên AccessTrade.
  2. Các Publisher quảng bá sản phẩm/dịch vụ bằng cách sử dụng link tiếp thị liên kết (Affiliate Link) do AccessTrade cung cấp.
  3. Khi khách hàng mua hàng hoặc hoàn thành hành động cụ thể (như đăng ký, điền form), AccessTrade sẽ ghi nhận giao dịch đó.
  4. AccessTrade phân phối hoa hồng từ nhà cung cấp đến Publisher.
*/
@Injectable()
export class AccessTradeJob {
  private readonly logger = new Logger('AccessTradeJob');

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    // private readonly _notification: NotificationV2Service,
    private readonly _repo: MainRepo,
    private readonly _vndc: VNDCService,
    private readonly httpService: HttpService,
  ) {
    this.logger.log('Initializing AccessTradeJob');
  }

  // Lấy Giao Dịch Đã Được Chấp Nhận từ AccessTrade
  // Chạy mỗi 5 giờ tại phút thứ 15 (0 15 */5 * * *).

  /*
    Giây (0): Chạy tại giây thứ 0.
    Phút (15): Chạy tại phút thứ 15.
    Giờ (*)/5): Chạy mỗi 5 giờ.
    Ngày (*): Mỗi ngày.
    Tháng (*): Mỗi tháng.
    Thứ trong tuần (*): Mỗi ngày trong tuần.
  */

  // Cronjob sẽ chạy vào các giờ chia hết cho 5
  @Cron('0 15 */5 * * *', { timeZone: TIME_ZONE_VN })

  // (status: APPROVED) từ AccessTrade và xử lý chúng cho mục đích hoàn tiền và chiến dịch.
  // Gửi request đến API AccessTrade để lấy các giao dịch trong 1 ngày với trạng thái APPROVED
  async getTransactionFromAccessTradeOnApproved() {
    // if (!IS_PRODUCTION) return;
    this.logger.log(`getTransactionFromAccessTradeOnApprovedV2`);
    const current = new Date();
    this.logger.log(
      `Start job campaign for transaction approve at ${current.toISOString()}`,
    );

    // 1. get all transaction from AccessTrade (for campaign processing)
    //  Thực hiện yêu cầu đến API của AccessTrade để lấy tất cả giao dịch trong vòng 1 ngày với trạng thái APPROVED.
    const url = this.getAccessTradeUrl({
      current,
      status: ACCESS_TRADE_TRANS_STATUS.APPROVED,
      day: 1,
    });

    // https://api.accesstrade.com/transactions?since=2023-12-26T00:00:00.000Z&until=2023-12-27T00:00:00.000Z&status=1
    console.log({ url });

    try {
      // const transactions = (
      //   await this.httpService.get(url, { headers: HEADER }).toPromise()
      // ).data as TransactionRes;

      const transactions: TransactionRes = {
        total: 1,
        data: [
          {
            id: UtilsService.getInstance().randomAlphanumeric(6),
            status: 1, // 0 - hold, 1 - approved, 2 - rejected
            merchant: '',
            utm_term: '',
            utm_content: '',
            utm_source: '',
            utm_campaign: '',
            utm_medium: '',
            transaction_id: '',
            transaction_value: 1,
            transaction_time: '',
            update_time: '',
            confirmed_time: '',
            is_confirmed: 1, //0 - pending , 1 - approved
            commission: 1,
            product_price: 1,
            product_id: '',
          },
        ],
      };

      this.logger.log(
        `Access trade transaction approve total: ${transactions.total} url: ${url}`,
      );

      if (transactions.total === 0) {
        this.logger.log(
          `Finish job campaign for transaction approve at ${new Date().toISOString()}`,
        );
        return;
      }
      const configAmount = this.getAmountForPayment();

      // 2. get exchange rate to convert VND to BTC
      //  Lấy tỷ giá từ VNĐ sang BTC (hoặc một loại tiền mã hóa khác) để tính toán chính xác giá trị của phần thưởng hoàn tiền.
      const { rateValue, currencyId } = await this.getExchangeRateSAT();

      // 3. handle transaction
      // Với từng giao dịch, nếu chưa được xác nhận (is_confirmed: false),

      for (const transaction of transactions.data) {
        const options = {
          transaction,
          configAmount,
          rateValue,
          currencyId,
          until: current.toISOString(),
        };

        // Với từng giao dịch, nếu chưa được xác nhận (is_confirmed: false),
        // lưu vào trạng thái chờ(PENDING); nếu đã xác nhận(is_confirmed: true),
        if (!transaction.is_confirmed) this.insertCbTransPending(options);
        //// cập nhật thành công(SUCCESS) và gửi thông báo cho người dùng.
        else this.insertCbTransSuccess(options);
      }
    } catch (error) {
      this.logger.error(
        `Job-campaign transaction approve url: ${url} error: ${JSON.stringify(
          error,
        )}`,
      );
    }
    this.logger.log(
      `Finish job campaign for transaction approve at ${new Date().toISOString()}`,
    );
  }

  // Chạy mỗi 5 giờ tại phút thứ 30 (0 30 */5 * * *).
  // Xử lý giao dịch trạng thái "Hold" từ AccessTrade
  @Cron('0 30 */5 * * *', { timeZone: TIME_ZONE_VN })
  async getTransactionFromAccessTradeOnHold() {
    if (!IS_PRODUCTION) return;
    this.logger.log(`getTransactionFromAccessTradeOnHoldV2`);
    const current = new Date();
    this.logger.log(
      `Start job campaign for transaction pending at ${current.toISOString()}`,
    );

    // 1. get all transaction from AccessTrade (for campaign processing)
    // Gửi request đến API AccessTrade để lấy các giao dịch trong trạng thái HOLD trong 1 ngày.
    const url = this.getAccessTradeUrl({
      current,
      status: ACCESS_TRADE_TRANS_STATUS.HOLD,
      day: 1,
    });

    try {
      const transactions = (
        await this.httpService.get(url, { headers: HEADER }).toPromise()
      ).data as TransactionRes;
      this.logger.log(
        `Access trade transaction pending total: ${transactions.total} url: ${url}`,
      );

      if (transactions.total === 0) {
        this.logger.log(
          `Finish job campaign for transaction pending at ${new Date().toISOString()}`,
        );
        return;
      }
      const configAmount = this.getAmountForPayment();
      // 2. get exchange rate to convert VND to BTC
      const { rateValue, currencyId } = await this.getExchangeRateSAT();
      // 3. handle transaction
      // Chuyển các giao dịch này vào trạng thái PROCESSING
      for (const transaction of transactions.data) {
        await this.insertCbTransPending({
          transaction,
          configAmount,
          rateValue,
          currencyId,
          until: current.toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Job-campaign transaction pending url: ${url} error: ${JSON.stringify(
          error,
        )}`,
      );
    }
    this.logger.log(
      `Finish job campaign for transaction pending at ${new Date().toISOString()}`,
    );
  }

  // Chạy mỗi 5 giờ tại phút thứ 45 (0 45 */5 * * *)
  // Lấy các giao dịch đang trong trạng thái PROCESSING hoặc APPROVED từ hệ thống.
  @Cron('0 45 */5 * * *', { timeZone: TIME_ZONE_VN })
  async checkStatusTransactionFromAccessTrade() {
    if (!IS_PRODUCTION) return;
    this.logger.log(`checkStatusTransactionFromAccessTradeV2`);
    const current = new Date();
    this.logger.log(
      `Start job check transaction pending from cashback_transaction at ${current.toISOString()}`,
    );

    try {
      // 1. get all cashback transaction status processing, approved with type payment
      const totalTransactions = await this._repo.getCbTrans().count({
        where: {
          OR: [
            { status: CASHBACK_STATUS.PROCESSING },
            { status: CASHBACK_STATUS.APPROVED },
          ],
          type: CASHBACK_TYPE.PAYMENT,
        },
      });

      this.logger.log(
        `Start job check transaction pending from cashback_transaction at ${JSON.stringify(
          totalTransactions,
        )}`,
      );

      if (totalTransactions === 0) return;

      const totalBlock = Math.round(totalTransactions / MAX_ITEMS);

      for (let index = 0; index < totalBlock; index++) {
        const cbTransPending = await this._repo.getCbTrans().findMany({
          where: {
            OR: [
              { status: CASHBACK_STATUS.PROCESSING },
              { status: CASHBACK_STATUS.APPROVED },
            ],
            type: CASHBACK_TYPE.PAYMENT,
          },
          select: {
            id: true,
            amount: true,
            type: true,
            accessTradeJson: true,
            currencyId: true,
            receiver: {
              select: {
                id: true,
                deviceToken: true,
                cbAvailable: { select: { currencyId: true, version: true } },
              },
            },
            createdAt: true,
            status: true,
            cbHistories: true,
          },
          orderBy: { createdAt: 'asc' },
          take: MAX_ITEMS,
          skip: index * MAX_ITEMS,
        });
        let url =
          this.getAccessTradeUrl({
            current,
            since: cbTransPending[0].createdAt,
          }) + `&${CAMPAIGN_PARAMS.TRANSACTION_ID}=`;

        cbTransPending.forEach((tran, index) => {
          url += tran.accessTradeJson[CAMPAIGN_PARAMS.TRANSACTION_ID];
          if (index < cbTransPending.length - 1) url += ',';
        });

        this.logger.log(`Check transaction pending url ${url}`);

        const response = await this.httpService
          .get(url, { headers: HEADER })
          .toPromise();
        const transactions = response.data as TransactionRes;
        this.logger.log(
          `Check transaction pending total: ${transactions.total}`,
        );
        for (const tran of transactions.data) {
          this.logger.log(
            `transaction info -> id: ${tran.transaction_id}, product_id: ${tran.product_id}, status: ${tran.status}, is_confirmed: ${tran.is_confirmed}`,
          );

          // 3. check status transaction
          if (tran.status === ACCESS_TRADE_TRANS_STATUS.HOLD) return;

          const cbTran = cbTransPending.find(
            (t) =>
              t.accessTradeJson[CAMPAIGN_PARAMS.TRANSACTION_ID] ===
                tran.transaction_id &&
              t.accessTradeJson['product_id'] === tran.product_id,
          );
          if (!cbTran) return;

          let newCbStatus = CASHBACK_STATUS.SUCCESS;
          if (tran.status === ACCESS_TRADE_TRANS_STATUS.REJECTED) {
            newCbStatus = CASHBACK_STATUS.REJECTED;
          } else if (!tran.is_confirmed) {
            if (cbTran.status === CASHBACK_STATUS.APPROVED) return;
            else newCbStatus = CASHBACK_STATUS.APPROVED;
          }
          const bulkOps: PrismaPromise<any>[] = [];

          const campaignId = tran[CAMPAIGN_PARAMS.CAMPAIGN];
          const campaign = await this._repo
            .getCampaign()
            .findUnique({ where: { id: campaignId }, select: { title: true } });

          const dailyReward = await this.getRewardDailyLuckyWheelByAccount(
            cbTran.receiver.id,
            tran.transaction_value,
            tran.transaction_time,
          );

          let description = COMMON_NOTE_STATUS[newCbStatus];
          if (dailyReward.reward && newCbStatus === CASHBACK_STATUS.SUCCESS) {
            description = COMMON_DESCRIPTION.CASHBACK.DAILY_REWARD.replace(
              '$value',
              `${dailyReward.reward}`,
            );
          }

          // 4. handle transaction after change status
          // 4.1.1 update status cashback_transaction approved, history
          const cbHistories = cbTran.cbHistories || { cbHistories: [] };
          cbHistories['cbHistories'].push({
            note: description,
            updatedAt: new Date().toISOString(),
          });

          // 4.1.2 update amount cashback_available
          if (newCbStatus === CASHBACK_STATUS.SUCCESS) {
            const amount = cbTran.amount.add(dailyReward.reward);
            const cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput =
              {
                id: tran.id,
                amount,
                actionType: CASHBACK_ACTION_TYPE.ADD,
                receiverId: cbTran.receiver.id,
                description,
                cbHistories,
                status: CASHBACK_STATUS.SUCCESS,
                currencyId: cbTran.currencyId,
              };

            const payload = {
              cbTransaction,
              version: cbTran.receiver.cbAvailable.find(
                (x) => x.currencyId === cbTran.currencyId,
              ).version,
            };

            // 4.1.3 update campaign totalTrans, totalCommission
            if (campaign) {
              bulkOps.push(
                this._repo.getCampaign().update({
                  data: {
                    countTrans: { increment: 1 },
                    totalCommission: { increment: tran.commission },
                  },
                  where: { id: campaignId },
                }),
              );
            }
            if (dailyReward.rewardId) {
              const luckyWheelHistories = dailyReward.luckyWheelHistories || {
                luckyWheelHistories: [],
              };
              luckyWheelHistories['luckyWheelHistories'].push({
                note:
                  dailyReward.title +
                  COMMON_NOTE_STATUS.DAILY_REWARD_PAYMENT_USED,
                updatedAt: new Date().toISOString(),
              });

              payload['luckyWheelData'] = {
                id: dailyReward.rewardId,
                transactionId: cbTran.id,
                rewardStatus: ACCOUNT_LUCKY_WHEEL_STATUS.USED,
                luckyWheelHistories,
              };
            }

            await this._clientWallet
              .send(MESSAGE_PATTERN.WALLET.APPROVE_DAILY_LUCKY_WHEEL, payload)
              .toPromise();
          } else {
            bulkOps.push(
              this._repo.getCbTrans().update({
                where: { id: cbTran.id },
                data: {
                  amount: 0,
                  status: newCbStatus,
                  description,
                  cbHistories,
                },
              }),
            );
          }

          // 4.1.4 insert and send notification
          this._repo.transaction(bulkOps).then(() => {
            const trans: Transaction = {
              id: cbTran.id,
              accountId: cbTran.receiver.id,
              status: newCbStatus,
              transactionValue: tran.transaction_value,
            };
            this.handleNotification(
              trans,
              cbTran.receiver.deviceToken,
              campaign?.title || tran.merchant,
            );
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Job check transaction pending error: ${JSON.stringify(error)}`,
      );
    }

    this.logger.log(
      `Finish job check transaction pending from cashback_transaction at ${new Date().toISOString()}`,
    );
  }

  private async handleNotification(
    trans: Transaction,
    deviceToken: string,
    name: string,
  ) {
    const value = Intl.NumberFormat().format(trans.transactionValue);
    const description = NOTIFY_DESCRIPTION.PAYMENT[trans.status]
      .replace('$value', value)
      .replace('$name', name);

    await this._repo.getNotification().create({
      data: {
        type: NOTIFICATION_TYPE.PAYMENT,
        title: COMMON_TITLE[CASHBACK_TYPE.PAYMENT],
        description,
        accountId: trans.accountId,
        ref: trans.id,
      },
    });
    // if (deviceToken) {
    //   this._notification.sendNotifyPayment([trans.accountId], description);
    // }
  }

  private async getExchangeRateSAT() {
    const exchangeRate = await this._vndc.getExchangeRate();
    const { ask, bid } =
      exchangeRate[`${CURRENCY_CODE.SATOSHI}${CURRENCY_CODE.VNDC}`];
    const { id: currencyId } = await this._repo.getCurrency().findUnique({
      where: { code: CURRENCY_CODE.SATOSHI },
      select: { id: true },
    });
    return { rateValue: Number(ask < bid ? ask : bid), currencyId };
  }

  private getAmountForPayment() {
    // TODO get config commission cms
    return 0.6;
  }

  private async insertCbTransSuccess(options: CashbackInsertOptions) {
    this.logger.log(
      `insertCbTransSuccess: ${JSON.stringify(options.transaction)}`,
    );
    const { currencyId, configAmount, rateValue, transaction, until } = options;
    const type = CASHBACK_TYPE.PAYMENT;
    // 1. extract info from tran
    const status = CASHBACK_STATUS.SUCCESS;
    const { accountId, campaignId } = extractInfo(
      transaction[CAMPAIGN_PARAMS.CONTENT],
      transaction[CAMPAIGN_PARAMS.CAMPAIGN],
    );

    // hàm kiểm tra xem giao dịch này đã tồn tại trong hệ thống chưa bằng cách tìm kiếm trong bảng CashbackTransaction
    const cbTransExist = await this._repo
      .getCbTrans()
      .findMany({ where: { accessTradeId: transaction.transaction_id } });
    const checkCbTransExist = cbTransExist.some(
      (tran) => tran.accessTradeJson['product_id'] === transaction.product_id,
    );

    // Nếu đã tồn tại, hàm dừng lại để tránh ghi nhận giao dịch trùng lặp
    // Điều này giúp bảo vệ hệ thống khỏi các giao dịch không hợp lệ hoặc bị ghi lại nhiều lần.
    if (checkCbTransExist) return;

    // 1. Lấy thông tin tài khoản và chiến dịch
    // 2. hàm lấy thông tin của chiến dịch (nếu có campaignId) để có thể cập nhật số lượng giao dịch và tổng hoa hồng.
    const [{ account, version }, campaign] = await Promise.all([
      this._repo.getCbAvailable().findFirst({
        where: { accountId, currency: { code: CURRENCY_CODE.SATOSHI } },
        select: { account: { select: { deviceToken: true } }, version: true },
      }),
      this._repo
        .getCampaign()
        .findUnique({ where: { id: campaignId }, select: { title: true } }),
    ]);
    if (!account) return;

    const transactionId = UtilsService.getInstance().getDbDefaultValue().id;
    // get daily reward by account
    // Tính toán hoàn tiền hàng ngày
    const dailyReward = await this.getRewardDailyLuckyWheelByAccount(
      accountId,
      transaction.transaction_value,
      transaction.transaction_time,
      rateValue,
    );
    let description = COMMON_NOTE_STATUS[status];

    // Nếu tài khoản có phần thưởng hàng ngày (dailyReward.value > 0),
    // hàm cập nhật mô tả của giao dịch với thông tin về phần thưởng hàng ngày này.
    if (dailyReward.value) {
      description = COMMON_DESCRIPTION.CASHBACK.DAILY_REWARD.replace(
        '$value',
        `${dailyReward.reward}`,
      );
    }

    // 2. get amount commission
    // Tính toán số tiền hoa hồng hợp lệ

    // Số tiền cashback cuối cùng (amount) được tính bằng cách chuyển đổi commissionValid
    // sang đơn vị tiền tệ VNDC hoặc Satoshi dựa trên rateValue,
    // cộng thêm phần thưởng hàng ngày(dailyReward.value)
    const commissionValid = transaction.commission * configAmount;
    const amount = Math.round(commissionValid / rateValue) + dailyReward.value;
    if (amount === 0) return;

    const bulkOps: PrismaPromise<any>[] = [];

    // cbTransaction là đối tượng giao dịch hoàn tiền với trạng thái SUCCESS
    const cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput = {
      id: transactionId,
      type,
      amount,
      currencyId,
      actionType: CASHBACK_ACTION_TYPE.ADD,
      status,
      accessTradeJson: transaction,
      receiverId: accountId,
      description,
      createdAt: new Date(transaction.transaction_time),
      campaignId: campaignId || null,
      accessTradeId: transaction.transaction_id,
      title: COMMON_TITLE[CASHBACK_TYPE.PAYMENT],
      cbHistories: {
        cbHistories: [
          { note: description, updatedAt: new Date().toISOString() },
        ],
      },
    };

    const payload = { cbTransaction, version, isNewTx: true };

    // 4. increment count transaction, total commission for campaign
    // 5. create job_campaign_history for account
    if (campaign) {
      bulkOps.push(
        this._repo.getCampaign().update({
          data: {
            countTrans: { increment: 1 },
            totalCommission: { increment: transaction.commission },
          },
          where: { id: campaignId },
        }),
        this._repo.getJobCampaign().create({
          data: {
            accountId,
            campaignId,
            createdAt: until,
            message: 'success',
          },
        }),
      );
    } else {
      this._repo
        .getJobCampaign()
        .create({ data: { accountId, createdAt: until, message: 'success' } });
      bulkOps.push();
    }

    // Nếu người dùng có phần thưởng từ chương trình Lucky Wheel,
    // thông tin này sẽ được thêm vào lịch sử với trạng thái USED
    // để đánh dấu phần thưởng đã được sử dụng trong giao dịch này
    if (dailyReward.rewardId) {
      const luckyWheelHistories = dailyReward.luckyWheelHistories || {
        luckyWheelHistories: [],
      };
      luckyWheelHistories['luckyWheelHistories'].push({
        note: dailyReward.title + COMMON_NOTE_STATUS.DAILY_REWARD_PAYMENT_USED,
        updatedAt: new Date().toISOString(),
      });

      payload['luckyWheelData'] = {
        id: dailyReward.rewardId,
        transactionId: transactionId,
        rewardStatus: ACCOUNT_LUCKY_WHEEL_STATUS.USED,
        luckyWheelHistories,
      };
    }

    // Gửi yêu cầu phê duyệt giao dịch qua hệ thống ví
    await firstValueFrom(
      this._clientWallet.send(
        MESSAGE_PATTERN.WALLET.APPROVE_DAILY_LUCKY_WHEEL,
        payload,
      ),
    );
    await this._repo.transaction(bulkOps);

    // 6. insert and send notification
    const trans: Transaction = {
      id: transactionId,
      accountId,
      status,
      transactionValue: transaction.transaction_value,
    };
    this.handleNotification(
      trans,
      account.deviceToken,
      campaign?.title || transaction.merchant,
    );

    // Hàm gọi processCashbackForPartner để xử lý hoàn tiền cho người giới thiệu (referralFrom)
    // nếu có chương trình hoàn tiền cho đối tác liên kết.
    this.processCashbackForPartner({
      referralFrom: accountId,
      transactionId,
      totalValue: transaction.transaction_value,
      commission: Math.round(transaction.commission - commissionValid),
    });
  }

  /*
    1. Tạo URL để lấy giao dịch từ AccessTrade trong một khoảng thời gian nhất định
  */
  private getAccessTradeUrl(options: AccessTradeUrlOptions) {
    const { current, day, status, since = new Date(current) } = options;
    const until = current.toISOString();
    if (!options.since) since.setDate(current.getDate() - day);

    const url = new URL(ACCESS_TRADE_TRANSACTION);
    url.searchParams.set(CAMPAIGN_PARAMS.SINCE, since.toISOString());
    url.searchParams.set(CAMPAIGN_PARAMS.UNTIL, until);
    url.searchParams.set(
      CAMPAIGN_PARAMS.SOURCE,
      UtilsService.getInstance().getCampaignUtmSource(),
    );
    if (typeof status === 'number')
      url.searchParams.set(CAMPAIGN_PARAMS.STATUS, status.toString());

    return url.href;
  }

  private async insertCbTransPending(options: CashbackInsertOptions) {
    this.logger.log(
      `insertCbTransPending: ${JSON.stringify(options.transaction)}`,
    );
    const { transaction, currencyId, configAmount, rateValue, until } = options;
    const type = CASHBACK_TYPE.PAYMENT;

    // 1. extract info from tran
    const status =
      transaction.status === ACCESS_TRADE_TRANS_STATUS.APPROVED
        ? CASHBACK_STATUS.APPROVED
        : CASHBACK_STATUS.PROCESSING;
    const { accountId, campaignId } = extractInfo(
      transaction[CAMPAIGN_PARAMS.CONTENT],
      transaction[CAMPAIGN_PARAMS.CAMPAIGN],
    );

    const cbTransExist = await this._repo
      .getCbTrans()
      .findMany({ where: { accessTradeId: transaction.transaction_id } });
    const checkCbTransExist = cbTransExist.some(
      (tran) => tran.accessTradeJson['product_id'] === transaction.product_id,
    );
    if (checkCbTransExist) return;

    const [account, campaign] = await Promise.all([
      this._repo.getAccount().findUnique({
        where: { id: accountId },
        select: { deviceToken: true },
      }),
      this._repo
        .getCampaign()
        .findUnique({ where: { id: campaignId }, select: { title: true } }),
    ]);
    if (!account) return;

    // 2. get amount commission
    const commissionValid = transaction.commission * configAmount;
    const amount = Math.round(commissionValid / rateValue);
    if (amount === 0) return;

    const bulkOps: PrismaPromise<any>[] = [];
    bulkOps.push(
      // 3. insert transaction to table cashback_transaction
      this._repo.getCbTrans().create({
        data: {
          type,
          amount,
          currencyId,
          actionType: CASHBACK_ACTION_TYPE.ADD,
          status,
          description: COMMON_NOTE_STATUS[status],
          accessTradeJson: transaction,
          receiverId: accountId,
          campaignId: campaignId || null,
          accessTradeId: transaction.transaction_id,
          title: COMMON_TITLE[CASHBACK_TYPE.PAYMENT],
          cbHistories: {
            cbHistories: [
              {
                note: COMMON_NOTE_STATUS[status],
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          createdAt: new Date(transaction.transaction_time),
        },
      }),
    );

    // 5. create job_campaign_history for account
    if (campaign) {
      bulkOps.push(
        this._repo.getJobCampaign().create({
          data: {
            accountId,
            campaignId,
            createdAt: until,
            message: 'success',
          },
        }),
      );
    } else {
      bulkOps.push(
        this._repo.getJobCampaign().create({
          data: { accountId, createdAt: until, message: 'success' },
        }),
      );
    }

    const res = await this._repo.transaction(bulkOps);

    // 6. insert and send notification
    const trans: Transaction = {
      id: res[1]['id'],
      accountId,
      status,
      transactionValue: transaction.transaction_value,
    };
    this.handleNotification(
      trans,
      account.deviceToken,
      campaign?.title || transaction.merchant,
    );
    this.processCashbackForPartner({
      referralFrom: accountId,
      transactionId: res[1]['id'],
      totalValue: transaction.transaction_value,
      commission: Math.round(transaction.commission - commissionValid),
    });
  }

  private async getRewardDailyLuckyWheelByAccount(
    accountId: string,
    transactionValue: number,
    time: string,
    rate?: number,
  ) {
    const accountReward = await this._repo
      .getAccountDailyLuckyWheel()
      .findFirst({
        where: {
          accountId,
          isApproved: true,
          type: DAILY_LUCKY_WHEEL_TYPE.PAYMENT,
          status: ACCOUNT_LUCKY_WHEEL_STATUS.USED,
          rewardStatus: ACCOUNT_LUCKY_WHEEL_STATUS.NEW,
        },
        orderBy: { createdAt: 'desc' },
      });
    if (accountReward) {
      const { rewardAt, rewardTitle, reward, luckyWheelHistories } =
        accountReward;
      const transactionTime = new Date(time);
      const rewardExp = new Date(rewardAt);
      rewardExp.setHours(rewardExp.getHours() + EXPIRATION_REWARD);

      if (transactionTime >= rewardAt && rewardExp >= transactionTime) {
        const rateValue = rate || (await this.getExchangeRateSAT()).rateValue;
        const amount = Math.round(
          (transactionValue * (reward / 100)) / rateValue,
        );

        this.logger.log(
          `getRewardDailyLuckyWheelByAccount Reward: ${amount}(${rewardTitle})`,
        );
        return {
          rewardId: accountReward.id,
          value: Number(amount),
          title: rewardTitle,
          reward,
          luckyWheelHistories,
        };
      }
    }
    return { reward: 0 };
  }

  private async processCashbackForPartner(input: CommissionPartnerProps) {
    const { referralFrom, ...others } = input;
    const parent = await this._repo.getAccountReferral().findFirst({
      where: { referralFrom, referralByInfo: { isPartner: true } },
      select: { referralBy: true },
    });
    if (!parent) return;
    this.logger.log(
      `processCashbackForPartner referralFrom: ${JSON.stringify(referralFrom)}`,
    );

    await this._repo
      .getAccountPartnerCommission()
      .create({ data: { ...others, accountId: parent.referralBy } });
  }
}

function extractInfo(content: string, campaign: string) {
  const output: { accountId?: string; campaignId?: string } = {
    accountId: content,
    campaignId: campaign,
  };
  return output;
}
