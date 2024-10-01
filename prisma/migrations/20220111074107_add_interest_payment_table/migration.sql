-- CreateTable
CREATE TABLE "interest_payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "exchange_rate" DOUBLE PRECISION NOT NULL,
    "total_accounts" INTEGER NOT NULL DEFAULT 0,
    "total_interest_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "highest_interest_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lowest_interest_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "average_interest_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "from_wallet_id" UUID NOT NULL,
    "to_wallet_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_payment_account" (
    "from_wallet_amount" DECIMAL(65,30) NOT NULL,
    "to_wallet_amount" DECIMAL(65,30) NOT NULL,
    "from_interest_amount" DECIMAL(65,30) NOT NULL,
    "to_interest_amount" DECIMAL(65,30) NOT NULL,
    "interest_payment_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "cashback_transaction_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("interest_payment_id","account_id")
);

-- CreateIndex
CREATE INDEX "interest_payment.date_time_from_wallet_id_to_wallet_id_index" ON "interest_payment"("date_time", "from_wallet_id", "to_wallet_id");

-- CreateIndex
CREATE INDEX "interest_payment_account.interest_payment_id_account_id_cashback_transaction_id_index" ON "interest_payment_account"("interest_payment_id", "account_id", "cashback_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "interest_payment_account_cashback_transaction_id_unique" ON "interest_payment_account"("cashback_transaction_id");

-- AddForeignKey
ALTER TABLE "interest_payment" ADD FOREIGN KEY ("from_wallet_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment" ADD FOREIGN KEY ("to_wallet_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment_account" ADD FOREIGN KEY ("interest_payment_id") REFERENCES "interest_payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment_account" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment_account" ADD FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
