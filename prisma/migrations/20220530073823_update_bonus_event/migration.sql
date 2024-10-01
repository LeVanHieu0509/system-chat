/*
  Warnings:

  - You are about to drop the column `paid_out` on the `bonus_event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bonus_event" DROP COLUMN IF EXISTS "paid_out",
ADD COLUMN IF NOT EXISTS "broker_id" UUID NOT NULL DEFAULT E'00000000-0000-0000-0000-000000000000',
ADD COLUMN IF NOT EXISTS "created_id" UUID NOT NULL DEFAULT E'00000000-0000-0000-0000-000000000000',
ADD COLUMN IF NOT EXISTS "updated_id" UUID;

-- AddForeignKey
ALTER TABLE "bonus_event" ADD FOREIGN KEY ("broker_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event" ADD FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterIndex
ALTER INDEX "chicken_farm_breed_hen_id_unique" RENAME TO "chicken_farm_breed.hen_id_unique";

-- AlterIndex
ALTER INDEX "vndc_transaction_cashback_transaction_id_unique" RENAME TO "vndc_transaction.cashback_transaction_id_unique";

-- AlterIndex
ALTER INDEX "account_setting_account_id_unique" RENAME TO "account_setting.account_id_unique";

-- AlterIndex
ALTER INDEX "referral_ranking_account_cashback_transaction_id_unique" RENAME TO "referral_ranking_account.cashback_transaction_id_unique";

-- AlterIndex
ALTER INDEX "kai_transaction_cashback_transaction_id_unique" RENAME TO "kai_transaction.cashback_transaction_id_unique";

-- AlterIndex
ALTER INDEX "interest_payment_account_cashback_transaction_id_unique" RENAME TO "interest_payment_account.cashback_transaction_id_unique";
