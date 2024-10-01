-- AlterTable
ALTER TABLE "account" ADD COLUMN     "secret_key" VARCHAR(255),
ADD COLUMN     "type" VARCHAR NOT NULL DEFAULT E'USER';

-- AlterTable
ALTER TABLE "account_history" ADD COLUMN     "json" JSONB;

-- CreateTable
CREATE TABLE "cashback_transaction_broker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" INTEGER NOT NULL DEFAULT 0,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fee" INTEGER DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "action_type" INTEGER NOT NULL,
    "title" VARCHAR(150),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "old_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency_id" UUID NOT NULL,
    "sender_id" UUID,
    "receiver_id" UUID,
    "histories" JSONB,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cashback_transaction_broker.currency_id_index" ON "cashback_transaction_broker"("currency_id");

-- CreateIndex
CREATE INDEX "cashback_transaction_broker.receiver_id_index" ON "cashback_transaction_broker"("receiver_id");

-- CreateIndex
CREATE INDEX "cashback_transaction_broker.sender_id_index" ON "cashback_transaction_broker"("sender_id");

-- AddForeignKey
ALTER TABLE "cashback_transaction_broker" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction_broker" ADD FOREIGN KEY ("sender_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction_broker" ADD FOREIGN KEY ("receiver_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
