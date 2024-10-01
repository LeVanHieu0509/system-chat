-- CreateTable
CREATE TABLE "config_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "time" INTEGER NOT NULL DEFAULT 0,
    "total_amount" INTEGER NOT NULL DEFAULT 0,
    "total_paid" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(10) NOT NULL DEFAULT E'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_id" UUID,
    "currency_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "config_event" ADD FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_event" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
