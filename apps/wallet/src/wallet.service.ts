import { MainRepo } from '@app/repositories/main.repo';
import { Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { BaseService } from './common/base.service';
import { AccountReferralPayloadDto, UserDepositPayloadDto } from './common/dto';
import { LockVersionMismatchException } from './exceptions/lock-version-mismatch.exception';

type CashbackTx = any; // Define a more specific type according to your Prisma schema

enum ActionType {
  DECREMENT = '-',
  INCREMENT = '+',
}

@Injectable()
export class WalletService extends BaseService {
  constructor(private readonly _repo: MainRepo) {
    super(WalletService.name);
  }

  // Xử lý việc giới thiệu tài khoản (referral).
  async accountReferral(input: AccountReferralPayloadDto) {
    this.logStart('accountReferral');

    const {
      accountReferral,
      cbTransactionBy,
      cbTransactionFrom,
      versionBy,
      versionFrom,
    } = input;
    cbTransactionBy.updatedAt = cbTransactionFrom.updatedAt = new Date();
    const bulkOps: PrismaPromise<any>[] = [];

    this._logger.db(`accountReferralRepository -> insert`, accountReferral);

    // Tạo bản ghi referral vào cơ sở dữ liệu.
    bulkOps.push(
      this._repo.getAccountReferral().create({
        data: accountReferral,
      }),
    );

    // Tăng số dư của cả hai tài khoản (cbTransactionBy và cbTransactionFrom) thông qua increaseBalance.
    await Promise.all([
      this.increaseBalance(cbTransactionBy, versionBy),
      this.increaseBalance(cbTransactionFrom, versionFrom),
    ]);

    const output = await this._repo.transaction(bulkOps);

    this.logEnd('accountReferral');
    return output;
  }

  //  Tăng số dư của một tài khoản.
  async increaseBalance(
    cbTransaction: CashbackTx,
    version: number,
    broker = false,
  ) {
    this.logStart(`increaseBalance -> accountId: ${cbTransaction.receiverId}`);
    const { amount, receiverId, currencyId } = cbTransaction;

    // Cập nhật thời gian giao dịch.
    cbTransaction.updatedAt = new Date();

    // Gọi updateBalance để cập nhật số dư hiện tại của tài khoản và trả về oldBalance
    cbTransaction.oldBalance = await this.updateBalance(
      amount,
      receiverId,
      currencyId,
      version,
      ActionType.INCREMENT,
    );

    // Chèn giao dịch hoàn tiền (cashback) vào cơ sở dữ liệu.
    const output = await this.insertCashbackTransaction(cbTransaction, broker);

    this.logEnd(`increaseBalance -> accountId: ${cbTransaction.receiverId}`);
    return output;
  }

  //  Giảm số dư của một tài khoản.
  async decreaseBalance(
    cbTransaction: CashbackTx,
    version: number,
    broker = false,
  ) {
    this.logStart(`decreaseBalance -> accountId: ${cbTransaction.receiverId}`);
    const { amount, senderId, currencyId } = cbTransaction;

    // Cập nhật thời gian giao dịch.
    cbTransaction.updatedAt = new Date();

    // Gọi updateBalance để cập nhật số dư hiện tại của tài khoản và trả về oldBalance
    cbTransaction.oldBalance = await this.updateBalance(
      amount,
      senderId,
      currencyId,
      version,
      ActionType.DECREMENT,
    );

    // Chèn giao dịch hoàn tiền (cashback) vào cơ sở dữ liệu.
    const output = await this.insertCashbackTransaction(cbTransaction, broker);

    this.logEnd(`decreaseBalance -> accountId: ${cbTransaction.receiverId}`);
    return output;
  }

  private async insertCashbackTransaction(
    cbTransaction: CashbackTx,
    broker = false,
  ) {
    // Giao dịch này có thể là của broker (nhà môi giới) hoặc giao dịch bình thường, dựa vào giá trị broker.
    // Broker là 1 user được tạo ra từ hệ thống -> hệ thống có thể chuyển tiền cho Broker -> Broker tiêu gì thì tiêu
    // Tài khoản này dùng để đi shill coin.

    const repoMethod = broker
      ? this._repo.getBrokerTransaction().create({ data: cbTransaction })
      : this._repo.getCbTrans().create({ data: cbTransaction });

    this._logger.db(
      `${
        broker ? 'cashbackTransactionBroker' : 'cashbackTransaction'
      } -> insert`,
      cbTransaction,
    );

    return repoMethod;
  }

  private async updateBalance(
    amount: number,
    accountId: string,
    currencyId: string,
    version: number,
    type: ActionType,
  ) {
    this.logStart(
      `updateBalance -> accountId: ${JSON.stringify({
        accountId_currencyId_version: {
          accountId: accountId,
          currencyId: currencyId,
          version: version,
        },
      })}`,
    );

    const cbAvailable = await this._repo.getCbAvailable().findUniqueOrThrow({
      where: {
        accountId_currencyId_version: {
          accountId: accountId,
          currencyId: currencyId,
          version: version,
        },
      },
    });

    if (!cbAvailable) {
      throw new LockVersionMismatchException();
    }

    const { amount: oldBalance, id: caId, updatedAt: lastUpdate } = cbAvailable;

    const data = {
      amount,
      caId: String(caId),
      oldBalance,
      lastUpdate,
      type,
    };

    this._logger.db(`cashbackAvailableHistories -> insert`, data);
    await this._repo.getCbAvailableHistory().create({
      data,
    });

    // Update cashback available amount
    const updateData =
      type === ActionType.INCREMENT
        ? { amount: { increment: amount } }
        : { amount: { decrement: amount } };

    const updateResult = await this._repo.getCbAvailable().updateMany({
      where: {
        accountId,
        currencyId,
        version,
      },
      data: updateData,
    });

    if (updateResult.count === 0) {
      throw new LockVersionMismatchException();
    }

    return oldBalance;
  }

  async userDeposit(input: UserDepositPayloadDto) {
    this.logStart(
      `userDeposit -> accountId: ${input.cbTransaction.receiverId}`,
    );

    const { cbTransaction, partnerTransaction, version } = input;
    cbTransaction.updatedAt = partnerTransaction.updatedAt = new Date();

    const output = await this._repo.transaction(async (prisma) => {
      this._logger.db(
        `partnerTransactionRepository -> update`,
        partnerTransaction,
      );

      const updateResult = await prisma.partnerTransaction.update({
        where: { orderId: partnerTransaction.orderId },
        data: { ...partnerTransaction },
      });

      if (!updateResult) {
        throw new LockVersionMismatchException();
      }

      return await this.increaseBalance(cbTransaction, version);
    });

    this.logEnd(`userDeposit -> accountId: ${input.cbTransaction.receiverId}`);
    return output;
  }
}
