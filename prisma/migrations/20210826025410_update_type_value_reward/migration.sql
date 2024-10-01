/*
  Warnings:

  - You are about to alter the column `reward` on the `account_daily_lucky_wheel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `reward` on the `config_daily_lucky_wheel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `reward` on the `config_payment_lucky_wheel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "account_daily_lucky_wheel" ALTER COLUMN "reward" SET DEFAULT 0,
ALTER COLUMN "reward" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "config_daily_lucky_wheel" ALTER COLUMN "reward" SET DEFAULT 0,
ALTER COLUMN "reward" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "config_payment_lucky_wheel" ALTER COLUMN "reward" SET DEFAULT 0,
ALTER COLUMN "reward" SET DATA TYPE INTEGER;
