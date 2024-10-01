/*
  Warnings:

  - You are about to drop the column `reward_id` on the `account_daily_lucky_wheel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transaction_id]` on the table `account_daily_lucky_wheel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "account_daily_lucky_wheel" DROP CONSTRAINT "account_daily_lucky_wheel_reward_id_fkey";

-- AlterTable
ALTER TABLE "account_daily_lucky_wheel" DROP COLUMN "reward_id",
ADD COLUMN     "reward_json" JSONB,
ADD COLUMN     "reward_status" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "transaction_id" UUID;

-- CreateTable
CREATE TABLE "account_daily_lucky_wheel_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daily_reward_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_daily_lucky_wheel_transaction_id_unique" ON "account_daily_lucky_wheel"("transaction_id");

-- AddForeignKey
ALTER TABLE "account_daily_lucky_wheel_history" ADD FOREIGN KEY ("daily_reward_id") REFERENCES "account_daily_lucky_wheel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_daily_lucky_wheel" ADD FOREIGN KEY ("transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
