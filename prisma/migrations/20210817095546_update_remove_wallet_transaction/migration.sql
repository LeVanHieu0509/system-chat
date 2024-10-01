/*
  Warnings:
  - You are about to drop the `wallet_transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_transaction_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "wallet_transaction" DROP CONSTRAINT "wallet_transaction_account_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transaction_history" DROP CONSTRAINT "wallet_transaction_history_transaction_id_fkey";

-- DropTable
DROP TABLE "wallet_transaction";

-- DropTable
DROP TABLE "wallet_transaction_history";
