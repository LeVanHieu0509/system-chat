-- CreateTable
CREATE TABLE "chicken_farm_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" INTEGER NOT NULL DEFAULT 1,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "type" SMALLINT NOT NULL DEFAULT 1,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "market_id" UUID,
    "currency_id" UUID,
    "buyer_id" UUID,
    "seller_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_transaction_market_id_unique" ON "chicken_farm_transaction"("market_id");

-- AddForeignKey
ALTER TABLE "chicken_farm_transaction" ADD FOREIGN KEY ("market_id") REFERENCES "chicken_farm_market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_transaction" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_transaction" ADD FOREIGN KEY ("buyer_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_transaction" ADD FOREIGN KEY ("seller_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
