/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `partner_transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "partner_transaction" ADD COLUMN     "transaction_id" VARCHAR(32);

-- CreateIndex
CREATE UNIQUE INDEX "partner_transaction.transaction_id_unique" ON "partner_transaction"("transaction_id");
