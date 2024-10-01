-- CreateTable
CREATE TABLE "vndc_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "vndc_transaction_number" TEXT,
    "vndc_fullname" TEXT,
    "vndc_username" TEXT,
    "vndc_json" JSONB,
    "wallet_address" TEXT NOT NULL,
    "cashback_transaction_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "tx_hash" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "kai_json" JSONB,
    "cashback_transaction_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vndc_transaction.vndc_transaction_number_unique" ON "vndc_transaction"("vndc_transaction_number");

-- CreateIndex
CREATE UNIQUE INDEX "vndc_transaction_cashback_transaction_id_unique" ON "vndc_transaction"("cashback_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "kai_transaction.tx_hash_unique" ON "kai_transaction"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "kai_transaction_cashback_transaction_id_unique" ON "kai_transaction"("cashback_transaction_id");

-- AddForeignKey
ALTER TABLE "vndc_transaction" ADD FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kai_transaction" ADD FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
