
-- CreateTable
CREATE TABLE "vndc_transaction" (
    "order_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" INTEGER NOT NULL DEFAULT 0,
    "state" VARCHAR(20) NOT NULL DEFAULT E'PENDING',
    "vndc_receiver" VARCHAR(50) NOT NULL,
    "store_id" INTEGER,
    "payme_id" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "histories" JSONB[],
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("order_id")
);

-- AddForeignKey
ALTER TABLE "vndc_transaction" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
