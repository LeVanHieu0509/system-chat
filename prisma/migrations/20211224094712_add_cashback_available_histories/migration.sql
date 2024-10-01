-- CreateTable
CREATE TABLE "cashback_available_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "old_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "type" VARCHAR(1),
    "last_update" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "ca_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cashback_available_histories.ca_id_index" ON "cashback_available_histories"("ca_id");

-- AddForeignKey
ALTER TABLE "cashback_available_histories" ADD FOREIGN KEY ("ca_id") REFERENCES "cashback_available"("id") ON DELETE CASCADE ON UPDATE CASCADE;
