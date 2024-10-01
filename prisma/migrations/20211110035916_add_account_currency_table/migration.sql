/*
  Warnings:

  - You are about to drop the column `currency_id` on the `account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_currency_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "currency_id";

-- CreateTable
CREATE TABLE "account_exchange_currency" (
    "account_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("account_id","currency_id")
);

-- AddForeignKey
ALTER TABLE "account_exchange_currency" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_exchange_currency" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
