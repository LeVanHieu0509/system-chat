import { CashbackTransactionEntity } from '../../entities/cashback-transaction.entity';

export interface RevertBalancePayloadDto {
  cbTransaction: CashbackTransactionEntity;
  version: number;
  broker?: boolean;
}
