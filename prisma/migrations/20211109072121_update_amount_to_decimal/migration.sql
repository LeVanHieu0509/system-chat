/*
  Warnings:

  - You are about to drop the column `match_move_account` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `match_move_card` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `match_move_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `match_move_wallet` on the `account` table. All the data in the column will be lost.
  - You are about to drop the `cashback_transaction_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account_balance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cashback_transaction_history" DROP CONSTRAINT "cashback_transaction_history_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "account_balance" DROP CONSTRAINT "account_balance_account_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "match_move_account",
DROP COLUMN "match_move_card",
DROP COLUMN "match_move_id",
DROP COLUMN "match_move_wallet";

-- AlterTable
ALTER TABLE "cashback_available" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "cashback_summary" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "cashback_transaction" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "old_balance" SET DEFAULT 0,
ALTER COLUMN "old_balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "chicken_farm_extra_slot" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "chicken_farm_transaction" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "config_event" ALTER COLUMN "total_amount" SET DEFAULT 0,
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "total_paid" SET DEFAULT 0,
ALTER COLUMN "total_paid" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "partner_transaction" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "amount_exchange" SET DEFAULT 0,
ALTER COLUMN "amount_exchange" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "cashback_transaction_history";

-- DropTable
DROP TABLE "account_balance";

-- CreateIndex
CREATE INDEX "cashback_transaction.sender_id_index" ON "cashback_transaction"("sender_id");

-- CreateIndex
CREATE INDEX "cashback_transaction.currency_id_index" ON "cashback_transaction"("currency_id");

-- CreateIndex
CREATE INDEX "chicken_farm_egg.owner_id_index" ON "chicken_farm_egg"("owner_id");

-- CreateIndex
CREATE INDEX "chicken_farm_adult.owner_id_index" ON "chicken_farm_adult"("owner_id");

-- CreateIndex
CREATE INDEX "chicken_farm_market.egg_id_index" ON "chicken_farm_market"("egg_id");

-- CreateIndex
CREATE INDEX "chicken_farm_market.chicken_id_index" ON "chicken_farm_market"("chicken_id");

-- CreateIndex
CREATE INDEX "chicken_farm_market.buyer_id_index" ON "chicken_farm_market"("buyer_id");

-- CreateIndex
CREATE INDEX "chicken_farm_market.seller_id_index" ON "chicken_farm_market"("seller_id");

-- CreateIndex
CREATE INDEX "chicken_farm_transaction.currency_id_index" ON "chicken_farm_transaction"("currency_id");

-- CreateIndex
CREATE INDEX "chicken_farm_transaction.market_id_index" ON "chicken_farm_transaction"("market_id");

-- CreateIndex
CREATE INDEX "chicken_farm_transaction.buyer_id_index" ON "chicken_farm_transaction"("buyer_id");

-- CreateIndex
CREATE INDEX "chicken_farm_transaction.seller_id_index" ON "chicken_farm_transaction"("seller_id");

-- AlterIndex
ALTER INDEX "cashback_transaction.idx_receiver_id" RENAME TO "cashback_transaction.receiver_id_index";

-- AlterIndex
ALTER INDEX "account_daily_lucky_wheel_transaction_id_unique" RENAME TO "account_daily_lucky_wheel.transaction_id_unique";

-- AlterIndex
ALTER INDEX "account_partner_commission_transaction_id_unique" RENAME TO "account_partner_commission.transaction_id_unique";

-- AlterIndex
ALTER INDEX "chicken_farm_adult_egg_id_unique" RENAME TO "chicken_farm_adult.egg_id_unique";

-- AlterIndex
ALTER INDEX "chicken_farm_transaction_market_id_unique" RENAME TO "chicken_farm_transaction.market_id_unique";

-- AlterIndex
ALTER INDEX "account_referral_referral_from_unique" RENAME TO "account_referral.referral_from_unique";
