/*
  Warnings:

  - You are about to drop the column `isApproved` on the `account_daily_lucky_wheel` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "account_daily_lucky_wheel" DROP COLUMN "isApproved",
ADD COLUMN     "is_approved" BOOLEAN DEFAULT true;
