/*
  Warnings:

  - You are about to drop the `withdraw_transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `withdraw_transaction_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "withdraw_transaction" DROP CONSTRAINT "withdraw_transaction_account_id_fkey";

-- DropForeignKey
ALTER TABLE "withdraw_transaction_history" DROP CONSTRAINT "withdraw_transaction_history_transaction_id_fkey";

-- DropTable
DROP TABLE "withdraw_transaction";

-- DropTable
DROP TABLE "withdraw_transaction_history";

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "type" SMALLINT,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "pay_me_json" JSONB,
    "pay_me_transaction" VARCHAR(100),
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction_history" (
    "id" UUID NOT NULL,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "transaction_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction_history" ADD FOREIGN KEY ("transaction_id") REFERENCES "wallet_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
