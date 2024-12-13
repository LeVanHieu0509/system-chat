import { Prisma } from '.prisma/client';
import {
  CASHBACK_ACTION_TYPE,
  CASHBACK_BROKER_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CURRENCY_CODE,
  MESSAGE_PATTERN,
  NOTIFICATION_TYPE,
  PARTNER_TRANS_TYPE,
  QUEUES,
  STATUS,
} from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { MethodType } from '@app/dto';
import { COMMON_TITLE, NOTIFY_DESCRIPTION } from '@app/notification';
import { MainRepo } from '@app/repositories/main.repo';
import { UtilsService } from '@app/utils';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAY_ME_STORE_ID } from 'libs/config';
import { LoggerService, Transaction, VNDCService } from 'libs/plugins';
import { OnusCallbackRequestDto, OnusMembershipQueryDto } from './onus.dto';

const MAX_RETRY = 5;
const MAX_DELAY = 3000; // 3 seconds

@Injectable()
export class OnusService {
  private _logger = new LoggerService(OnusService.name);

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    private readonly _repo: MainRepo,
    private readonly _vndc: VNDCService, // private readonly _notification: NotificationV2Service,
  ) {}

  async checkAccount(input: OnusMembershipQueryDto, brokerId: string) {
    this._logger.info(
      `checkAccount started: ${new Date().toISOString()} brokerId: ${brokerId} input:`,
      input,
    );

    try {
      const { amount = '0', email, phone, currency } = input;

      if (
        !currency ||
        ![CURRENCY_CODE.VNDC, CURRENCY_CODE.BBC].includes(currency)
      ) {
        throw new Error(VALIDATE_MESSAGE.CASHBACK.COIN_INVALID);
      }

      if (+amount < 1000) {
        throw new Error(VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID_MIN);
      }

      // Hàm kiểm tra xem người trung gian (brokerId) có số dư tối thiểu yêu cầu trong loại tiền tệ đó không.
      const brokerAmount = await this._repo.getCbAvailable().findFirst({
        where: {
          currency: { code: currency, status: STATUS.ACTIVE },
          accountId: brokerId,
        },
        select: { amount: true, currencyId: true },
      });

      console.log({ brokerAmount, brokerId });
      // Nếu số dư hiện tại không đủ so với số tiền yêu cầu (amount), hàm trả về lỗi AMOUNT_INVALID,
      // cho thấy số dư không đủ để thực hiện giao dịch.
      if (!brokerAmount || brokerAmount.amount.minus(amount).lt(0)) {
        throw new Error(VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID);
      }

      // Tìm kiếm tài khoản người dùng dựa trên email hoặc số điện thoại
      const where: Prisma.AccountWhereInput = {
        OR: [
          { email },
          { phone: phone && UtilsService.getInstance().toIntlPhone(phone) },
        ],
      };

      // Kiểm tra tính hợp lệ của tài khoản
      const accounts = await this._repo.getAccount().findMany({
        where,
        select: {
          id: true,
          status: true,
          fullName: true,
          deviceToken: true,
          phone: true,
          email: true,
        },
      });

      if (accounts.length !== 1) {
        throw new Error(VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID);
      }
      if (accounts[0].status !== STATUS.ACTIVE) {
        throw new Error('ACCOUNT_DISABLED');
      }

      this._logger.info(`checkAccount finished: ${new Date().toISOString()}`);
      return accounts[0];
    } catch (error) {
      this._logger.info(
        `checkAccount finished: ${new Date().toISOString()} with error: ${
          error.message
        }`,
      );
      throw error;
    }
  }

  // chịu trách nhiệm xử lý giao dịch thanh toán từ ONUS trong hệ thống
  // kiểm tra, xác minh, và thực hiện các thao tác để hoàn tất giao dịch

  /*
    1. Khi user thanh toán bên ONUS thì tiền việt sẽ qua ONUS và BITBACK sẽ update status của user đó thành PROCESSCING
    2. User click button bên BITBACK để gửi 1 request là tôi đã chuyển tiền qua cho hệ thống ONUS
    3. Dựa vào thông tin đó ONUS sẽ check ví xem user đã chuyển tiền hay chưa
    4. Nếu user đã chuyển tiền rồi thì ONUS sẽ gọi đến api callback của BITBACK 
    5. BITBACK check request của ONUS và dựa vào status của ONUS sẽ thực hiện func processTransaction
    6. 
  */
  async processTransaction(input: OnusCallbackRequestDto, brokerId: string) {
    // Ghi lại thông tin chi tiết về brokerId (ID của người trung gian)
    this._logger.info(
      `processTransaction started: ${new Date().toISOString()} brokerId: ${brokerId} input:`,
      input,
    );

    try {
      // Kiểm tra tài khoản hợp lệ trong hệ thống dựa trên thông tin từ ONUS
      const {
        id: accountId,
        fullName,
        deviceToken,
      } = await this.checkAccount(input, brokerId);

      // Lấy các thông tin giao dịch như số tiền (amount), loại tiền tệ (currency),
      // số giao dịch(transactionNumber), và ngày giao dịch(date).
      const transaction = await this.checkTransaction(
        input,
        accountId,
        brokerId,
      );

      const {
        amount: tranAmount,
        currency,
        date,
        display,
        id,
        from,
        transactionNumber,
      } = transaction as Transaction;

      const txDate = UtilsService.getInstance().toDayJs(date);
      const now = UtilsService.getInstance().toDayJs(new Date());

      // So sánh các dữ liệu giao dịch từ hệ thống ONUS và hệ thống của bạn:
      if (
        transactionNumber !== input.transactionNumber ||
        currency.symbol !== input.currency ||
        Number(tranAmount) !== Number(input.amount)
      ) {
        throw new Error('INVALID_PAYLOAD');
      }

      // Xác nhận rằng ngày giao dịch không quá cũ
      // So sánh txDate (ngày giao dịch) với ngày hiện tại (now) và đảm bảo rằng giao dịch không quá 1 ngày.
      if (txDate.isBefore(now.add(-1, 'day'))) {
        throw new Error('TRANSACTION_OUT_OF_DATE');
      }

      // Kiểm tra tài khoản gửi tiền
      // Đảm bảo rằng tài khoản gửi tiền (from.user.id) trong giao dịch
      // khớp với tài khoản vndcUserId trong yêu cầu từ ONUS.

      if (from.user.id !== input.vndcUserId) {
        throw new Error('RECEIVER_INVALID');
      }

      // Kiểm tra xem giao dịch với transactionNumber đã tồn tại trong hệ thống chưa
      const exists = await this._repo
        .getVNDCTransaction()
        .count({ where: { vndcTransactionNumber: transactionNumber } });

      if (exists) {
        throw new Error('TRANSACTION_ALREADY_EXISTED');
      }

      // Kiểm tra số dư của broker
      const brokerAmount = await this._repo.getCbAvailable().findFirst({
        where: {
          currency: { code: currency.symbol, status: STATUS.ACTIVE },
          accountId: brokerId,
        },
        select: { amount: true, currencyId: true, version: true },
      });

      // Nếu số dư sau khi trừ đi tranAmount nhỏ hơn 0, ném lỗi AMOUNT_INVALID
      if (!brokerAmount || brokerAmount.amount.minus(tranAmount).lt(0)) {
        throw new Error(VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID);
      }

      // Thực hiện thao tác upsert (thêm hoặc cập nhật)
      // vào bảng số dư cashback của tài khoản người nhận(CbAvailable).
      await this._repo.getCbAvailable().upsert({
        where: {
          accountId_currencyId_version: {
            accountId,
            currencyId: brokerAmount.currencyId,
            version: 1,
          },
        },
        create: {
          accountId,
          currencyId: brokerAmount.currencyId,
          reason: 'Nạp tiền từ ONUS',
        },
        update: {},
        select: { version: true },
      });

      const txId = UtilsService.getInstance().getDbDefaultValue().id;
      const amount = Number(tranAmount);
      const title = 'Nạp tiền từ ONUS';

      // Người gửi: "Chuyển ... đến ...".
      const senderDesc = `Chuyển ${Intl.NumberFormat().format(amount)} ${
        currency.symbol
      } đến ${fullName} cho giao dịch từ ONUS`;

      // Người nhận: "Nhận ... cho giao dịch từ ONUS".
      const receiverDesc = `Nhận ${Intl.NumberFormat().format(amount)} ${
        currency.symbol
      } cho giao dịch từ ONUS`;

      // Thêm các thông tin lịch sử giao dịch như số tiền, loại tiền, và thông tin giao dịch.
      const history = {
        currency,
        amount,
        display,
        id,
        from,
        transactionNumber,
      };

      // Giao dịch thêm tiền (cbTransaction) cho tài khoản người nhận.
      const cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput = {
        id: txId,
        amount,
        actionType: CASHBACK_ACTION_TYPE.ADD,
        currencyId: brokerAmount.currencyId,
        receiverId: accountId,
        type: CASHBACK_TYPE.ONUS_PAYMENT,
        title,
        description: receiverDesc,
        cbHistories: {
          cbHistories: [
            {
              note: receiverDesc,
              transaction: history,
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        status: CASHBACK_STATUS.SUCCESS,
      };

      // Giao dịch trừ tiền (cbTransactionBroker) cho broker.
      const cbTransactionBroker: Prisma.CashbackTransactionBrokerUncheckedCreateInput =
        {
          id: txId,
          amount,
          actionType: CASHBACK_ACTION_TYPE.SUBTRACT,
          currencyId: brokerAmount.currencyId,
          senderId: brokerId,
          transactionNumber,
          vndcUserId: input?.vndcUserId,
          type: CASHBACK_BROKER_TYPE.ONUS_PAYMENT,
          title,
          description: senderDesc,
          histories: {
            histories: [
              {
                note: senderDesc,
                transaction: history,
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          status: CASHBACK_STATUS.SUCCESS,
        };

      // Gọi hàm doProcessTransaction để xử lý cả hai giao dịch trên (người nhận và broker).
      await this.doProcessTransaction(cbTransaction, cbTransactionBroker);

      // Tạo giao dịch PartnerTransaction ghi nhận giao dịch với ONUS.
      await this._repo.transaction([
        this._repo.getPartnerTransaction().create({
          data: await this.generatePartnerTx(
            transaction,
            Number(input.amount),
            accountId,
            brokerAmount.currencyId,
            receiverDesc,
          ),
        }),
        // Tạo thông báo (Notification) cho người nhận tiền
        this._repo.getNotification().create({
          data: {
            id: txId,
            title,
            description: receiverDesc,
            type: NOTIFICATION_TYPE.ONUS_PAYMENT,
            accountId,
          },
          select: { id: true },
        }),
        // Ghi nhận giao dịch từ ONUS vào bảng VNDCTransaction.
        this._repo.getVNDCTransaction().create({
          data: {
            walletAddress: from.user.display,
            status: CASHBACK_STATUS.SUCCESS,
            vndcTransactionNumber: transactionNumber,
            vndcFullname: from.user.display,
            vndcUsername: from.user.display,
            cashbackTransactionId: txId,
          },
        }),
      ]);

      // Nếu tài khoản người nhận có deviceToken, gửi thông báo qua thiết bị di động.
      // if (deviceToken)
      //   this._notification.sendNotifications([accountId], title, receiverDesc);

      this._logger.info(
        `processTransaction finished: ${new Date().toISOString()}`,
      );
      return 'success';
    } catch (error) {
      this._logger.info(
        `processTransaction finished: ${new Date().toISOString()} with error: ${
          error.message
        }`,
      );
      throw error;
    }
  }

  private async checkTransaction(
    input: OnusCallbackRequestDto,
    accountId: string,
    brokerId: string,
    attempt = 1,
  ) {
    let transaction: Transaction;
    try {
      transaction = await this._vndc.getTransactionInfo(
        input.transactionNumber,
      );
      return transaction;
    } catch (err) {
      if (attempt < MAX_RETRY) {
        await this.wait();
        attempt++;
        transaction = await this.checkTransaction(
          input,
          accountId,
          brokerId,
          attempt,
        );
        return transaction;
      } else {
        throw new Error(VALIDATE_MESSAGE.CASHBACK.TRANSACTION_INVALID);
      }
    }
  }

  private async wait(time = MAX_DELAY) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), time);
    });
  }

  private async generatePartnerTx(
    transaction: Transaction,
    inputAmount: number,
    accountId: string,
    currencyId: string,
    desc: string,
  ) {
    const amount = inputAmount;
    const storeId = PAY_ME_STORE_ID;
    const orderId = UtilsService.getInstance()
      .getDbDefaultValue()
      .id.replace(/[-]/gm, '');

    let amountExchange = amount;
    let rateValue = 1;
    let description = desc;
    if (transaction.currency.symbol === CURRENCY_CODE.BBC) {
      const exchangeRate = await this._vndc.getExchangeRate();
      if (
        exchangeRate &&
        exchangeRate[`${CURRENCY_CODE.BBC}${CURRENCY_CODE.VNDC}`]
      ) {
        const { ask, bid } =
          exchangeRate[`${CURRENCY_CODE.BBC}${CURRENCY_CODE.VNDC}`];
        rateValue = Number(ask > bid ? ask : bid);
        amountExchange = Math.round(rateValue * amount);
        description = NOTIFY_DESCRIPTION.WALLET_PAYMENT.PENDING.replace(
          '$valueSAT',
          `${Intl.NumberFormat().format(amount)} ` + CURRENCY_CODE.BBC,
        ).replace('$valueVNDC', Intl.NumberFormat().format(amountExchange));
      }
    }

    const data: Prisma.PartnerTransactionUncheckedCreateInput = {
      accountId,
      amountExchange,
      amount,
      orderId,
      exchangeRate: rateValue,
      transactionId: orderId,
      type: PARTNER_TRANS_TYPE.INCOMING,
      title: COMMON_TITLE.PARTNER_SAT_PAYMENT,
      description,
      storeId,
      methodType: MethodType.PAY_ME,
      currencyId,
      status: CASHBACK_STATUS.SUCCESS,
      histories: { histories: [{ amount, orderId, amountExchange }] },
    };

    return data;
  }

  private async doProcessTransaction(
    cbTx: Prisma.CashbackTransactionUncheckedCreateInput,
    cbTransactionBroker: Prisma.CashbackTransactionBrokerUncheckedCreateInput,
    attempt = 1,
  ) {
    try {
      const [cbAvailable, cbAvailableBroker] = await Promise.all([
        this._repo.getCbAvailable().findFirst({
          where: { accountId: cbTx.receiverId, currencyId: cbTx.currencyId },
          select: { version: true },
        }),
        this._repo.getCbAvailable().findFirst({
          where: {
            accountId: cbTransactionBroker.senderId,
            currencyId: cbTransactionBroker.currencyId,
          },
          select: { version: true },
        }),
      ]);
      const payload = {
        cbTransaction: cbTx,
        cbTransactionBroker,
        version: cbAvailable.version,
        brokerVersion: cbAvailableBroker.version,
      };
      await this._clientWallet
        .send(MESSAGE_PATTERN.WALLET.BROKER_PROCESS, payload)
        .toPromise();
    } catch (error) {
      if (attempt < MAX_RETRY) {
        attempt++;
        await this.doProcessTransaction(cbTx, cbTransactionBroker, attempt);
      } else {
        this._logger.error(
          `doProcessTransaction finished: ${new Date().toISOString()} with error: ${
            error.message
          }`,
        );
        throw error;
      }
    }
  }
}
