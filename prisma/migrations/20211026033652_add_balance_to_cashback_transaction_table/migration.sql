-- AlterTable
ALTER TABLE "cashback_transaction" ADD COLUMN     "new_balance" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "old_balance" BIGINT NOT NULL DEFAULT 0;
