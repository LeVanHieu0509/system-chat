import { Injectable } from '@nestjs/common';
import { PrismaClient, PrismaPromise } from '@prisma/client';
import { BaseService } from './common/base.service';
import { LockVersionMismatchException } from './exceptions/lock-version-mismatch.exception';
import { MainRepo } from '@app/repositories/main.repo';
import { AccountReferralPayloadDto } from './common/dto';

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
    this._logger.db(`accountReferralRepository -> insert`, accountReferral),
      bulkOps.push(
        this._repo.getAccountReferral().create({
          data: accountReferral,
        }),
      );

    await this.increaseBalance(cbTransactionBy, versionBy);
    await this.increaseBalance(cbTransactionFrom, versionFrom);

    const output = await this._repo.transaction(bulkOps);

    this.logEnd('accountReferral');
    return output;
  }

  async increaseBalance(
    cbTransaction: CashbackTx,
    version: number,
    broker = false,
  ) {
    this.logStart(`increaseBalance -> accountId: ${cbTransaction.receiverId}`);
    const { amount, receiverId, currencyId } = cbTransaction;
    cbTransaction.updatedAt = new Date();

    cbTransaction.oldBalance = await this.updateBalance(
      amount,
      receiverId,
      currencyId,
      version,
      ActionType.INCREMENT,
    );

    const output = await this.insertCashbackTransaction(cbTransaction, broker);

    this.logEnd(`increaseBalance -> accountId: ${cbTransaction.receiverId}`);
    return output;
  }

  private async insertCashbackTransaction(
    cbTransaction: CashbackTx,
    broker = false,
  ) {
    if (broker) {
      this._logger.db(`cashbackTransactionBroker -()> insert`, cbTransaction);
      return await this._repo.getBrokerTransaction().create({
        data: cbTransaction,
      });
    } else {
      this._logger.db(`cashbackTransaction -> insert`, cbTransaction);
      return await this._repo.getCbTrans().create({
        data: cbTransaction,
      });
    }
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

    const cbAvailable = await this._repo.getCbAvailable().findUnique({
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
}
