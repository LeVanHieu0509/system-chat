-- CreateTable
CREATE TABLE "golden_egg_exchange_setting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "min_number_of_eggs" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "exchangeable" BOOLEAN NOT NULL DEFAULT false,
    "currency_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "golden_egg_exchange_setting.currency_id_unique" ON "golden_egg_exchange_setting"("currency_id");

-- AddForeignKey
ALTER TABLE "golden_egg_exchange_setting" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
