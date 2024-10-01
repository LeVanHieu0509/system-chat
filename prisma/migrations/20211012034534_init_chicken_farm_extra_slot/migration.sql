-- CreateTable
CREATE TABLE "chicken_farm_extra_slot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantity" SMALLINT NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "owner_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chicken_farm_extra_slot" ADD FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
