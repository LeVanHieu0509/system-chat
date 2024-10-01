-- CreateTable
CREATE TABLE IF NOT EXISTS "bonus_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(15) NOT NULL DEFAULT 'NEW',
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "link" TEXT,
    "prize_pool" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paid_out" DECIMAL(65,30) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "currency_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "bonus_event_account" (
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "account_id" UUID NOT NULL,
    "bonus_event_id" UUID NOT NULL,
    "cashback_transaction_id" UUID,

    PRIMARY KEY ("account_id","bonus_event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bonus_event_account.cashback_transaction_id_unique" ON "bonus_event_account"("cashback_transaction_id");

-- AddForeignKey
ALTER TABLE "bonus_event" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event_account" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event_account" ADD FOREIGN KEY ("bonus_event_id") REFERENCES "bonus_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event_account" ADD FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
