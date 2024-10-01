/*
  Warnings:

  - You are about to drop the column `type` on the `partner_transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "partner_transaction" DROP COLUMN "type",
ADD COLUMN     "amount_exchange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "partner_type" SMALLINT NOT NULL DEFAULT 1,
ALTER COLUMN "vndc_receiver" DROP NOT NULL;
