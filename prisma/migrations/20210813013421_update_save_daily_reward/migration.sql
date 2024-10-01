/*
  Warnings:

  - You are about to drop the column `reward_json` on the `account_daily_lucky_wheel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "account_daily_lucky_wheel" DROP COLUMN "reward_json",
ADD COLUMN     "isApproved" BOOLEAN DEFAULT true,
ADD COLUMN     "reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reward_at" TIMESTAMP(3),
ADD COLUMN     "reward_title" VARCHAR(150),
ADD COLUMN     "type" SMALLINT;

