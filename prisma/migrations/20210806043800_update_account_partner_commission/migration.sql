-- CreateTable
CREATE TABLE "account_partner_commission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commission" INTEGER NOT NULL DEFAULT 0,
    "total_value" INTEGER NOT NULL DEFAULT 0,
    "account_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_partner_commission_transaction_id_unique" ON "account_partner_commission"("transaction_id");

-- AddForeignKey
ALTER TABLE "account_partner_commission" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_partner_commission" ADD FOREIGN KEY ("transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
