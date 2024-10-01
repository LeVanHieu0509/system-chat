/*
  Warnings:

  - You are about to drop the column `referralBy` on the `config_commission` table. All the data in the column will be lost.
  - You are about to drop the column `referralFrom` on the `config_commission` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "config_commission" DROP COLUMN "referralBy",
DROP COLUMN "referralFrom",
ADD COLUMN     "referral_by" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referral_from" INTEGER NOT NULL DEFAULT 0;

