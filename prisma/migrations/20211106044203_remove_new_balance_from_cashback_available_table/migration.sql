/*
  Warnings:

  - You are about to drop the column `new_balance` on the `cashback_transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cashback_transaction" DROP COLUMN "new_balance",
ALTER COLUMN "action_type" DROP DEFAULT;

ALTER TABLE "cashback_transaction" ADD CONSTRAINT "cashback_transaction_action_type_check" CHECK ("action_type" = -1 OR "action_type" = 1)