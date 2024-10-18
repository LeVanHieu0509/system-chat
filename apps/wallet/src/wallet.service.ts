import { Injectable } from '@nestjs/common';
import { BaseService } from './common/base.service';
import { CashbackTransactionEntity } from './entities/cashback-transaction.entity';

type CashbackTx = CashbackTransactionEntity;

enum ActionType {
  DECREMENT = '-',
  INCREMENT = '+',
}

@Injectable()
export class WalletService extends BaseService {
  constructor() {
    super(WalletService.name);
  }

  async increaseBalance(
    cbTransaction: CashbackTx,
    version: number,
    broker = false,
  ) {
    console.log({ cbTransaction });
    this.logStart(`increaseBalance -> accountId: ${cbTransaction.receiverId}`);
    const { amount, receiverId, currencyId } = cbTransaction;
    cbTransaction.updatedAt = new Date();

    // cbTransaction.oldBalance = await this.updateBalance(
    //   amount,
    //   receiverId,
    //   currencyId,
    //   version,
    //   ActionType.INCREMENT,
    // );

    // const output = await this.insertCashbackTransaction(cbTransaction, broker);

    this.logEnd(`increaseBalance -> accountId: ${cbTransaction.receiverId}`);
    return cbTransaction;
  }
}
