import { AccountReferral, Prisma } from '@prisma/client';

export interface CBAvailable {
  amount: string;
  currencyId: string;
  version: number;
}

export interface AccountReferralPayloadDto {
  cbTransactionFrom: Prisma.CashbackTransactionUncheckedCreateInput;
  cbTransactionBy: Prisma.CashbackTransactionUncheckedCreateInput;
  accountReferral: AccountReferral;
  versionFrom: number;
  versionBy: number;
}

export interface RevertBalancePayloadDto {
  cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput;
  version: number;
  broker?: boolean;
}

export interface UserDepositPayloadDto {
  cbTransaction: Prisma.CashbackTransactionUncheckedCreateInput;
  partnerTransaction: Prisma.PartnerTransactionUncheckedCreateInput;
  version?: number;
}

export interface EditPoolValueDto {
  poolId: string;

  eggValue: number;

  bbcValue: number;

  updatedId: string;
}
